namespace MyCityCouncil.Infrastructure.Options;

public class JwtOptions
{
    public string SecretKey { get; set; }
    public int TokenExpiresHours { get; set; }
    public int RefreshTokenExpiresHours {get; set; }
}