namespace MyCityCouncil.Application.Features.UsersS.GetProfile;

public record UserProfileDto(
    Guid Id,
    string FullName,
    string Email,
    string RoleName,
    DateTime MemberSince,
    string HomePhone,
    string WorkPhone,
    List<CommissionMembershipDto> Commissions
);

public record CommissionMembershipDto(
    string CommitteeName,
    DateTime AppointedAt,
    DateTime? DismissedAt,
    bool IsChairman,
    string Status
);
