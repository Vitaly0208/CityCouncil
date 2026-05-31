using MediatR;

namespace MyCityCouncil.Application.Features.Parties.Members.AddMember;

public record AddMemberCommand(Guid PartyId, Guid UserId) : IRequest<MembershipJoinDto>;