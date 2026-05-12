using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Auth.RefreshToken;

public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, RefreshTokenDto>
{
    
    private readonly IJwtService _jwtService;

    public RefreshTokenHandler(IJwtService jwtService)
    {
        _jwtService = jwtService;
    }
    
    public async Task<RefreshTokenDto> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        var tokens = await _jwtService.ValidateRefreshJwt(request.Token, ct);
        
        if (tokens is null) 
            throw new UnauthorizedAccessException("Invalid refresh token");
        
        return new RefreshTokenDto
        {
            AccessToken = tokens.AccessToken,
            RefreshToken = tokens.RefreshToken,
            ExpiresIn = tokens.ExpiresIn,
        };
    }
}


