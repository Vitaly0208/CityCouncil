using System.Text.Json.Serialization;
using MyCityCouncil.Domain.Enums;

namespace MyCityCouncil.Domain.Models;

public class Initiative
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public InitiativeStatus Status { get; set; } = InitiativeStatus.PendingReview;
    
    public Guid UserId { get; set; }
    [JsonIgnore] 
    public User User { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedAt { get; set; }
    public DateTime? FinalizedAt { get; set; }
    
    [JsonIgnore] public List<VotingInfo> VotingHistory { get; set; } = new();
}



