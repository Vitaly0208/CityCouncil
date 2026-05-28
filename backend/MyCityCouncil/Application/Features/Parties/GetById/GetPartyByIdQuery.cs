using MediatR;

namespace MyCityCouncil.Application.Features.Parties.GetById;

public record GetPartyByIdQuery(Guid Id) : IRequest<PartyDto>;