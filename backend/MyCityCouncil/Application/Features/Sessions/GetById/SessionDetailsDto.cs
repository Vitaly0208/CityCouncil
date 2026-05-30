using MyCityCouncil.Application.Features.Voting;

namespace MyCityCouncil.Application.Features.Sessions.GetById;

public record SessionDetailDto(
    Guid Id,
    string Title,
    DateTime HeldAt,
    string? Location,
    Guid CommitteeId,
    string CommitteeName,
    bool IsCompleted,
    int HearingRound,
    List<VotingInfoDto> Initiatives,
    List<AttendeeDto> Attendees
);