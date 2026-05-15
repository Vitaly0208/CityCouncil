using MediatR;

namespace MyCityCouncil.Application.Features.Initiatives.GetApproved;

public record GetApprovedInitiativesQuery : IRequest<List<InitiativeDto>>;