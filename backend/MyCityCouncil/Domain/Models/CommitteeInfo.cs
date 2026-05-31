using System.Text.Json.Serialization;
using MyCityCouncil.Domain.Enums;

namespace MyCityCouncil.Domain.Models;

public class CommitteeInfo
{       
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Statuses CStatus { get; set; } = Statuses.Active;
    public DateTime AppointedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DismissedAt { get; set; }
    
    public bool IsChairman { get; set; }
    
    public Guid UserId { get; set; }
    [JsonIgnore]
    public User User { get; set; }
    
    public Guid CommitteeId { get; set; }
    [JsonIgnore]
    public Committee Committee { get; set; }
}