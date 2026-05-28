namespace MyCityCouncil.Application.Features.Parties.Members.DismissMember;

public record MembershipLeftDto(Guid Id, Guid PartyId, Guid UserId, DateTime DismissedAt, string Status);