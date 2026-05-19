using MediatR;
using MyCityCouncil.Domain.Enums;

namespace MyCityCouncil.Application.Features.Voting.CastVote;

public record CastVoteCommand(Guid SessionId, Guid InitiativeId, VoteType VoteType, Guid VoterId) : IRequest<Unit>;