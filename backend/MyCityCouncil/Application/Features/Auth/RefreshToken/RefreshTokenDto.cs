using MyCityCouncil.Domain.DTO;

namespace MyCityCouncil.Application.Features.Auth.RefreshToken;

public record RefreshTokenDto
{
    public string? AccessToken { get; set; }
    public int ExpiresIn { get; set; }
    public string? RefreshToken { get; set; }
}