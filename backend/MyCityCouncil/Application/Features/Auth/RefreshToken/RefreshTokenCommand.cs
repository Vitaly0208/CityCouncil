using MediatR;

namespace MyCityCouncil.Application.Features.Auth.RefreshToken;

public record RefreshTokenCommand : IRequest<RefreshTokenDto>
{
    public string Token { get; set; }
}