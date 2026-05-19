namespace MyCityCouncil.Application.Features.Sessions.GetAll;

public record SessionListDto(
    Guid Id,
    string Title,
    DateTime HeldAt,
    string? Location,
    string CommitteeName,
    bool IsCompleted,
    int InitiativesCount
);  