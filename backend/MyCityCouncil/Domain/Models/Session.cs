using System.Text.Json.Serialization;

namespace MyCityCouncil.Domain.Models;

public class Session
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime HeldAt { get; set; }
    public string? Location { get; set; }
    public bool IsCompleted { get; set; } = false;
    
    public Guid CommitteeId { get; set; }
    [JsonIgnore] 
    public Committee Committee { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [JsonIgnore] public List<VotingInfo> VotingResults { get; set; } = new();
    public List<SessionAttendee> Attendees { get; set; } = new();
}

public enum HearingRound { First, Second }