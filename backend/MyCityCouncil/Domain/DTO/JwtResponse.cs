namespace MyCityCouncil.Domain.DTO;

public class JwtResponse
{
    public string? AccessToken { get; set; }
    public int ExpiresIn { get; set; }
    public string? RefreshToken { get; set; }
}