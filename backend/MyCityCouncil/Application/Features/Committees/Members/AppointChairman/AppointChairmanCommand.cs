using MediatR;

namespace MyCityCouncil.Application.Features.Committees.Members.AppointChairman;

public record AppointChairmanCommand(Guid CommitteeId, Guid UserId) : IRequest<MembershipDto>;