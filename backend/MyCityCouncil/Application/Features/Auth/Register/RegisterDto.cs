using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Auth.Register;

public record RegisterDto
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
    
    
    public static RegisterDto Map(User user, string accessToken, string refreshToken)
    {
        return new RegisterDto
        {
            Id = user.Id,
            Email = user.Email,
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };
    }
}