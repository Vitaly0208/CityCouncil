using MediatR;

namespace MyCityCouncil.Application.Features.Parties.Members.DismissMember;

public record DismissMemberCommand(Guid PartyId, Guid UserId) : IRequest<MembershipLeftDto>;