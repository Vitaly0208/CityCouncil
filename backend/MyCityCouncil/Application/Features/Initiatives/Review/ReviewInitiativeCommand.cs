using MediatR;
using MyCityCouncil.Application.Features.Initiatives;
using MyCityCouncil.Domain.Enums;

namespace MyCityCouncil.Application.Features.Initiatives.Review;

public record ReviewInitiativeCommand(
    Guid InitiativeId,
    bool IsApproved,
    Guid ReviewedByUserId
) : IRequest<InitiativeDto>;