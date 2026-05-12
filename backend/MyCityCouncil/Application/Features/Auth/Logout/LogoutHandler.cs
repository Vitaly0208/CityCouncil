using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Auth.Logout;

public class LogoutHandler : IRequestHandler<LogoutCommand, Unit>
{
    private readonly IJwtService _jwtService;
    private readonly IUserRepository _userRepository;

    public LogoutHandler(
        IJwtService jwtService, 
        IUserRepository userRepository
        )
    {
        _jwtService = jwtService;
        _userRepository = userRepository;
    }
    
    public async Task<Unit> Handle(LogoutCommand request, CancellationToken ct =  default)
    {
        await _jwtService.RevokeRefreshs(request.UserId, ct);
        return Unit.Value; 
    }
}