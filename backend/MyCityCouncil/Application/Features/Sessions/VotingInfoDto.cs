using MyCityCouncil.Application.Features.Voting;
using MyCityCouncil.Domain.Enums;

namespace MyCityCouncil.Application.Features.Sessions;

public record VotingInfoDto(
    Guid Id,
    Guid InitiativeId,
    string InitiativeTitle,
    string InitiativeDescription,
    string InitiativeAuthor,
    DateTime InitiativeCreatedAt,
    InitiativeStatus Status,
    bool IsFinalized,
    int HearingRound,
    List<VoteDto> Votes
);