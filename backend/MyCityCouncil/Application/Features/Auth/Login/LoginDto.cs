using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Auth.Login;

public record LoginDto
{
    public Guid UserId { get; init; }
    public string Email { get; init; }
    public string AccessToken { get; init; }
    public string RefreshToken { get; init; }


    public static LoginDto Map(User user, string accessToken, string refreshToken)
    {
        return new LoginDto
        {
            UserId = user.Id,
            Email = user.Email,
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };
    }
}