using System.Text.Json.Serialization;

namespace MyCityCouncil.Domain.Models;

public class PartiesInfo
{
    public Guid Id { get; set; }
    public string PStatus { get; set; } = string.Empty;
    public DateTime AppointedAt { get; set; }
    public DateTime? DismissedAt { get; set; }
    public bool IsActive => !DismissedAt.HasValue;
    
    public Guid UserId { get; set; }
    [JsonIgnore]
    public User User { get; set; }
    
    public Guid PartyId { get; set; }
    [JsonIgnore]
    public Party Party { get; set; }
}