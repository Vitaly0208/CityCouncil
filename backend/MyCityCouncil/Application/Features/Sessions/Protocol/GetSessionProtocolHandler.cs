using MediatR;
using MyCityCouncil.Application.Features.Sessions.Protocol;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Sessions.Protocol;
public class GetSessionProtocolHandler : IRequestHandler<GetSessionProtocolQuery, SessionProtocolDto?>
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IVotingRepository _votingRepository;

    public GetSessionProtocolHandler(
        ISessionRepository sessionRepository,
        IVotingRepository votingRepository)
    {
        _sessionRepository = sessionRepository;
        _votingRepository = votingRepository;
    }

    public async Task<SessionProtocolDto?> Handle(GetSessionProtocolQuery request, CancellationToken ct)
    {
        var session = await _sessionRepository.GetByIdAsync(request.SessionId, ct);
        if (session == null || !session.IsCompleted) return null;

        var initiatives = session.VotingResults?.Select(vr =>
        {
            var allVotes = _votingRepository.GetVotesByInitiativeAsync(vr.InitiativeId, ct).Result;
            var totalFor = _votingRepository.CountVotesByInitiativeAndTypeAsync(vr.InitiativeId, VoteType.For, ct).Result;
            var totalAgainst = _votingRepository.CountVotesByInitiativeAndTypeAsync(vr.InitiativeId, VoteType.Against, ct).Result;
            
            var votesByRound = allVotes
                .GroupBy(v => v.VotingInfo.HearingRound)
                .Select(g => new ProtocolVoteSummaryDto(
                    HearingRound: g.Key,
                    VotesFor: g.Count(v => v.Type == VoteType.For),
                    VotesAgainst: g.Count(v => v.Type == VoteType.Against)
                ))
                .OrderBy(r => r.HearingRound)
                .ToList();

            return new ProtocolInitiativeDto(
                Id: vr.InitiativeId,
                Title: vr.InitiativeTitle,
                Description: vr.InitiativeDescription,
                Author: vr.InitiativeAuthor,
                FinalStatus: vr.Status,
                TotalVotesFor: totalFor,
                TotalVotesAgainst: totalAgainst,
                VotesByRound: votesByRound
            );
        }).ToList() ?? new List<ProtocolInitiativeDto>();

        var attendees = session.Attendees?.Select(a => new ProtocolAttendeeDto(
            Id: a.UserId,
            Name: a.User != null 
                ? $"{a.User.LastName} {a.User.FirstName} {a.User.MiddleName}".Trim() 
                : string.Empty,
            Role: a.User?.Role?.Name ?? "Депутат"
        )).ToList() ?? new List<ProtocolAttendeeDto>();

        return new SessionProtocolDto(
            Id: session.Id,
            Title: session.Title,
            HeldAt: session.HeldAt,
            Location: session.Location,
            CommitteeName: session.Committee?.Name ?? string.Empty,
            CommitteeId: session.CommitteeId,
            HearingRound: session.HearingRound,
            IsCompleted: session.IsCompleted,
            FinalizedAt: session.FinalizedAt,
            Initiatives: initiatives,
            Attendees: attendees
        );
    }
}