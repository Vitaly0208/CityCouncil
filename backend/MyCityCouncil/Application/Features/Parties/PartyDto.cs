namespace MyCityCouncil.Application.Features.Parties;

public record PartyDto(
    Guid Id,
    string Name,
    string? Abbreviation,
    string? Ideology,
    List<PartyMemberDto> Members
);

public record PartyMemberDto(
    Guid UserId,
    string FullName,
    DateTime AppointedAt,
    DateTime? DismissedAt,
    bool IsActive
);