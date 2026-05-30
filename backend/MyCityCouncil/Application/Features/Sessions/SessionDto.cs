
namespace MyCityCouncil.Application.Features.Sessions;

public record SessionDto(
    Guid Id,
    string Title,
    DateTime HeldAt,
    string? Location,
    string CommitteeName,
    Guid CommitteeId,
    bool IsCompleted,
    int HearingRound,
    List<VotingInfoDto> Initiatives
);