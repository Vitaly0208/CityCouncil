using MyCityCouncil.Domain.Enums;

namespace MyCityCouncil.Api.Controllers.Requests;

public class CastVoteRequest
{
    public Guid SessionId { get; set; }
    public Guid InitiativeId { get; set; }
    public VoteType VoteType { get; set; }
}