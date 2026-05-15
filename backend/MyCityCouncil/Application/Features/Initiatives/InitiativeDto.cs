using MyCityCouncil.Domain.Enums;

namespace MyCityCouncil.Application.Features.Initiatives;

public record InitiativeDto(
    Guid Id,
    string Title,
    string Description,
    InitiativeStatus Status,
    Guid UserId,
    string AuthorName,
    DateTime CreatedAt,
    DateTime? ApprovedAt,
    DateTime? FinalizedAt
);