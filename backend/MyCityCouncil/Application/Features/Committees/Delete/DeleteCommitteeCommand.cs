using MediatR;

namespace MyCityCouncil.Application.Features.Committees.Delete;

public record DeleteCommitteeCommand(Guid CommitteeId) : IRequest<Unit>;