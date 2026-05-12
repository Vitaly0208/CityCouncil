using MediatR;

namespace MyCityCouncil.Application.Features.Committees.Members.Dismiss;

public record DismissMemberCommand(Guid CommitteeId, Guid UserId) : IRequest<MembershipDto>;