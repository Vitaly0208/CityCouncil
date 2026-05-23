namespace MyCityCouncil.Application.Features.Sessions.GetById;

public record SessionDetailDto(
    Guid Id,
    string Title,
    DateTime HeldAt,
    string? Location,
    string CommitteeName,
    bool IsCompleted,
    List<VotingInfoDto> Initiatives,
    List<AttendeeDto> Attendees
);

public record VotingInfoDto(
    Guid Id,
    Guid InitiativeId,
    string InitiativeTitle,
    string Status,
    bool IsFinalized,
    List<VoteDto> Votes
);

public record VoteDto(
    Guid VoterId,
    string VoteType,
    DateTime VotedAt
);