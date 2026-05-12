using MediatR;
using MyCityCouncil.Application.Features.Committees.Members;

namespace MyCityCouncil.Application.Features.Committees.Members.AddMember;

public record AddMemberCommand(Guid CommitteeId, Guid UserId) : IRequest<MembershipDto>;