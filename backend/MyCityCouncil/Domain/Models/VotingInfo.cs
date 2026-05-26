using System.Text.Json.Serialization;
using MyCityCouncil.Domain.Enums;

namespace MyCityCouncil.Domain.Models;

public class VotingInfo
{
    public Guid Id { get; set; }
    
    public string SessionTitle { get; set; } = string.Empty;
    public string InitiativeTitle { get; set; } = string.Empty;
    public InitiativeStatus Status { get; set; }
    public DateTime InitiativeCreatedAt { get; set; }
    public Guid AuthorId { get; set; }
    public DateTime VotedAt { get; set; } = DateTime.UtcNow;
    public bool IsFinalized { get; set; } = false;
    
    public Guid SessionId { get; set; }
    [JsonIgnore] public Session Session { get; set; } = null!;
    
    public Guid InitiativeId { get; set; }
    [JsonIgnore] public Initiative Initiative { get; set; } = null!;
    
    [JsonIgnore] public ICollection<Vote> Votes { get; set; } = new List<Vote>();
}