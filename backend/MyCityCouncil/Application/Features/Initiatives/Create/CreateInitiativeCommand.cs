using MediatR;

namespace MyCityCouncil.Application.Features.Initiatives.Create;

public record CreateInitiativeCommand(
    string Title,
    string Description,
    Guid UserId,
    Guid? CommitteeId // Nullable для безопасности
) : IRequest<CreateInitiativeResponseDto>;