namespace MyCityCouncil.Application.Features.Committees.GetDetails;

public record CommitteeDetailsDto(
    Guid Id,
    string Name,
    string Specialization,
    string? Description,
    bool IsArchived,
    List<CommitteeMemberDto> CurrentMembers,
    List<CommitteeHistoryEntryDto> History,
    List<InitiativeSummaryDto> AcceptedInitiatives, 
    List<SessionSummaryDto> UpcomingSessions
); 

public record CommitteeMemberDto(
    Guid UserId,
    string FullName,
    bool IsChairman,
    DateTime AppointedAt
);

public record CommitteeHistoryEntryDto(
    Guid UserId,
    string FullName,
    bool WasChairman,
    DateTime AppointedAt,
    DateTime? DismissedAt
);

public record InitiativeSummaryDto(
    Guid Id,
    string Title,
    string AuthorName,
    DateTime CreatedAt
);

public record SessionSummaryDto(
    Guid Id,
    string Title,
    DateTime HeldAt,
    string? Location
);