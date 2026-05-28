namespace MyCityCouncil.Application.Features.Parties.Members.AddMember;

public record MembershipJoinDto(Guid Id, Guid PartyId, Guid UserId, DateTime AppointedAt, string Status);