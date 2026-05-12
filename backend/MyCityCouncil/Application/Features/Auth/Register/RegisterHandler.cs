using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;


namespace MyCityCouncil.Application.Features.Auth.Register;

public class RegisterHandler : IRequestHandler<RegisterCommand, RegisterDto>
{
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RegisterHandler(
        IJwtService jwtService, 
        IPasswordHasher passwordHasher,  
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IUnitOfWork unitOfWork)
    {
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
        _userRepository = userRepository;
        _roleRepository  = roleRepository;
        _unitOfWork = unitOfWork;
    }
    
    public async Task<RegisterDto> Handle(RegisterCommand request,  CancellationToken ct)
    {
        if (await _userRepository.ExistsByEmailAsync(request.Email, ct))
            throw new InvalidOperationException("User with this email already exists.");
        
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FirstName = request.FirstName,
            MiddleName = request.MiddleName,
            LastName = request.LastName,
            WorkPhone = request.WorkPhone,
            HomePhone = request.HomePhone
        };  
        
        var hashedPassword = _passwordHasher.Generate(request.Password);
        user.PasswordHash = hashedPassword;
        
        var role = await _roleRepository.GetRoleByName("User", ct)
                   ?? throw new InvalidOperationException("Default role 'User' not found.");
        user.RoleId = role.Id;
        
        await _userRepository.AddAsync(user, ct);
        
        var tokens = await _jwtService.GenerateToken(user, ct);
        
        if (string.IsNullOrEmpty(tokens.RefreshToken) || string.IsNullOrEmpty(tokens.AccessToken))
            throw new InvalidOperationException("JWT token generation failed.");
        
        await _unitOfWork.SaveAsync(ct);
        
        return RegisterDto.Map(user, tokens.AccessToken, tokens.RefreshToken);

    }
}