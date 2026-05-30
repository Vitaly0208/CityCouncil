namespace MyCityCouncil.Application.Features.Sessions.GetAll;

public record SessionListDto(
    Guid Id,
    string Title,
    DateTime HeldAt,
    string? Location,
    Guid CommitteeId,
    string CommitteeName,
    bool IsCompleted,
    int InitiativesCount
);  