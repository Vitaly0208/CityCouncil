using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Auth.Login;

public class LoginHandler : IRequestHandler<LoginCommand, LoginDto>
{
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    
    public LoginHandler(
        IJwtService jwtService, 
        IPasswordHasher passwordHasher, 
        IUserRepository userRepository,
        IUnitOfWork unitOfWork
        )
    {
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<LoginDto> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, ct);

        if (user is null || user.IsBlocked)
            throw new UnauthorizedAccessException("Invalid credentials");
        
        if (!_passwordHasher.Verify(request.Password, user.PasswordHash) || request.Password.Length == 0)
            throw new UnauthorizedAccessException("Invalid credentials");
        
        var tokens = await _jwtService.GenerateToken(user, ct);
        
        if (string.IsNullOrEmpty(tokens.RefreshToken) || string.IsNullOrEmpty(tokens.AccessToken))
            throw new InvalidOperationException("JWT token generation failed.");
        await _unitOfWork.SaveAsync(ct);
        
        return LoginDto.Map(user, tokens.AccessToken, tokens.RefreshToken);
    }

}