namespace MyCityCouncil.Application.Features.Sessions;
public record SessionDto(
    Guid Id,
    string Title,
    DateTime HeldAt,
    string? Location,
    Guid CommitteeId,
    List<Guid> InitiativeIds
);