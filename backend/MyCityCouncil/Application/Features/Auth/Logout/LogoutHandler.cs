using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Auth.Logout;

public class LogoutHandler : IRequestHandler<LogoutCommand, Unit>
{
    private readonly IJwtService _jwtService;
    private readonly ILogger<LogoutHandler> _logger;

    public LogoutHandler(
        IJwtService jwtService, 
        ILogger<LogoutHandler> logger
        )
    {
        _jwtService = jwtService;
        _logger = logger;
    }
    
    public async Task<Unit> Handle(LogoutCommand request, CancellationToken ct =  default)
    {
        await _jwtService.RevokeRefreshs(request.UserId, ct);
        _logger.LogInformation("ВЫХОД ИЗ АККАУНТА: UserId={UserId}", request.UserId);
        
        return Unit.Value; 
    }
}