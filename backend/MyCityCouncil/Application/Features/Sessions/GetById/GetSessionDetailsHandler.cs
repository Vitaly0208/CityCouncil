using MediatR;
using MyCityCouncil.Application.Features.Sessions;
using MyCityCouncil.Application.Features.Voting;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Sessions.GetById;

public class GetSessionDetailsHandler : IRequestHandler<GetSessionDetailsQuery, SessionDetailDto>
{
    private readonly ISessionRepository _sessionRepository;

    public GetSessionDetailsHandler(ISessionRepository sessionRepository) =>
        _sessionRepository = sessionRepository;

    public async Task<SessionDetailDto> Handle(GetSessionDetailsQuery request, CancellationToken ct)
    {
        var session = await _sessionRepository.GetByIdAsync(request.SessionId, ct)
            ?? throw new KeyNotFoundException("Заседание не найдено");

        return new SessionDetailDto(
            Id: session.Id,
            Title: session.Title,
            HeldAt: session.HeldAt,
            Location: session.Location,
            CommitteeName: session.Committee?.Name ?? string.Empty,
            CommitteeId: session.CommitteeId,
            IsCompleted: session.IsCompleted,
            HearingRound: session.HearingRound,
            Initiatives: session.VotingResults?.Select(vr => new VotingInfoDto(
                Id: vr.Id,
                InitiativeId: vr.InitiativeId,
                InitiativeTitle: vr.InitiativeTitle,
                InitiativeDescription: vr.InitiativeDescription,
                InitiativeAuthor: vr.InitiativeAuthor,
                InitiativeCreatedAt: vr.InitiativeCreatedAt,
                Status: vr.Status,
                IsFinalized: vr.IsFinalized,
                HearingRound: vr.HearingRound,
                Votes: vr.Votes?.Select(v => new VoteDto(
                    Id: v.Id,
                    VoterId: v.VoterId,
                    VoterName: v.Voter != null 
                        ? $"{v.Voter.LastName} {v.Voter.FirstName}".Trim() 
                        : string.Empty,
                    VoteType: (int)v.Type
                )).ToList() ?? new List<VoteDto>()
            )).ToList() ?? new List<VotingInfoDto>(),
            Attendees: session.Attendees?.Select(a => new AttendeeDto(
                Id: a.UserId,
                Name: a.User != null 
                    ? $"{a.User.LastName} {a.User.FirstName} {a.User.MiddleName}".Trim() 
                    : string.Empty,
                Role: a.User?.Role?.Name ?? "Депутат"
            )).ToList() ?? new List<AttendeeDto>()
        );
    }
}