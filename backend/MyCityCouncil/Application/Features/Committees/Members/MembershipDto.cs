namespace MyCityCouncil.Application.Features.Committees.Members;

public record MembershipDto(
    Guid Id, 
    Guid UserId, 
    Guid CommitteeId, 
    DateTime AppointedAt, 
    bool IsChairman);