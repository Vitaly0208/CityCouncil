using MediatR;

namespace MyCityCouncil.Application.Features.Initiatives.GetAllByStatus;

public record GetAllInitiativesByStatusQuery(
    string? Status = null
) : IRequest<List<InitiativeDto>>;