using MyCityCouncil.Domain.Enums;

namespace MyCityCouncil.Application.Features.Initiatives.Create;

public record CreateInitiativeResponseDto(
    Guid Id,
    string Title,
    string Description,
    InitiativeStatus Status,
    Guid? CommitteeId,
    string? CommitteeName,
    DateTime CreatedAt
);