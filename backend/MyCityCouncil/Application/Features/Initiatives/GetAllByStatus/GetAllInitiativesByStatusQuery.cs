using MediatR;

namespace MyCityCouncil.Application.Features.Initiatives.GetAllByStatus;

public record GetAllInitiativesByStatusQuery(
    string? Status,
    string? SearchTerm = null,
    int PageSize = 20  
) : IRequest<List<InitiativeDto>>;