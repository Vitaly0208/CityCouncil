using MyCityCouncil.Domain.Enums;

namespace MyCityCouncil.Domain.Models;

public class Vote
{
    public Guid Id { get; set; }
    
    public Guid VotingInfoId { get; set; }
    public VotingInfo VotingInfo { get; set; } = null!;
    
    public Guid VoterId { get; set; }
    public VoteType Type { get; set; }
    public DateTime VotedAt { get; set; } = DateTime.UtcNow;
}