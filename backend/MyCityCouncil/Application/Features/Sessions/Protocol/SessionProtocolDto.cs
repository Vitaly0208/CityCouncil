using MyCityCouncil.Domain.Enums;

namespace MyCityCouncil.Application.Features.Sessions.Protocol;

public record SessionProtocolDto(
    Guid Id,
    string Title,
    DateTime HeldAt,
    string? Location,
    string CommitteeName,
    Guid CommitteeId,
    int HearingRound,
    bool IsCompleted,
    DateTime? FinalizedAt,
    List<ProtocolInitiativeDto> Initiatives,
    List<ProtocolAttendeeDto> Attendees
);

public record ProtocolInitiativeDto(
    Guid Id,
    string Title,
    string Description,
    string Author,
    InitiativeStatus FinalStatus,
    int TotalVotesFor,
    int TotalVotesAgainst,
    List<ProtocolVoteSummaryDto> VotesByRound
);

public record ProtocolVoteSummaryDto(
    int HearingRound,
    int VotesFor,
    int VotesAgainst
);

public record ProtocolAttendeeDto(
    Guid Id,
    string Name,
    string Role
);