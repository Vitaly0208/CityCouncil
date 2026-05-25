using MediatR;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.UsersS.GetByCommittee;

public record GetUsersByCommitteeQuery(Guid CommitteeId) : IRequest<List<User>>;