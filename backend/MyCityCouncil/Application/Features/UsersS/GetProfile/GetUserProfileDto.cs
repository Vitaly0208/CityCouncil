namespace MyCityCouncil.Application.Features.UsersS.GetProfile;

public record UserProfileDto(
    Guid Id,
    string FullName,
    string Email,
    string RoleName,    
    DateTime MemberSince,
    string HomePhone,
    string WorkPhone,
    int RatingScore,
    List<CommissionMembershipDto> Commissions,
    PartyMembershipDto? CurrentParty,
    List<AcceptedInitiativeDto> AcceptedInitiatives,
    List<SessionAttendanceDto> Attendances
);

public record CommissionMembershipDto(
    Guid CommitteeId, 
    string CommitteeName,
    DateTime AppointedAt,
    DateTime? DismissedAt,
    bool IsChairman,
    string Status
);

public record PartyMembershipDto(
    Guid PartyId,
    string PartyName,
    string? Abbreviation,
    string? Ideology,
    DateTime AppointedAt
);

public record AcceptedInitiativeDto(
    Guid Id,
    string Title,
    string Description,
    DateTime ApprovedAt,
    Guid? CommitteeId,
    string CommitteeName
);

public record SessionAttendanceDto(
    Guid SessionId,
    string SessionTitle,
    string CommitteeName,
    DateTime HeldAt,
    bool WasAttended,
    int HearingRound
);