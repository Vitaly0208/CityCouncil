using System.Text.Json.Serialization;

namespace MyCityCouncil.Domain.Models;

public class User
{
    public Guid Id { get; set; }
    public string FirstName { get; set; }
    public string MiddleName { get; set; }
    public string LastName { get; set; }
    public string PasswordHash { get; set; }
    public string Email { get; set; }
    public string HomePhone { get; set; }
    public string WorkPhone { get; set; }
    public int RatingScore { get; set; } = 0;
    public bool IsBlocked { get; set; } = false;
    
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    public Guid RoleId { get; set; }
    [JsonIgnore]
    public Role Role { get; set; } = null!;

    public List<CommitteeInfo> CommitteesMemberships { get; set; } = new();
    public List<PartiesInfo> PartyMemberships { get; set; } = new();
    
    [JsonIgnore]
    public List<RefreshToken> RefreshTokens { get; set; }
    
}


