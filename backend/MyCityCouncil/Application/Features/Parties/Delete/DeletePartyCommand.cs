using MediatR;

namespace MyCityCouncil.Application.Features.Parties.Delete;

public record DeletePartyCommand(Guid Id) : IRequest<Unit>;