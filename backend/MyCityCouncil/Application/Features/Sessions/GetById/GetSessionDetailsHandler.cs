using MediatR;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Sessions.GetById;

public class GetSessionDetailsHandler : IRequestHandler<GetSessionDetailsQuery, SessionDetailDto?>
{
    private readonly ISessionRepository _sessionRepository;

    public GetSessionDetailsHandler(ISessionRepository sessionRepository)
    {
        _sessionRepository = sessionRepository;
    }

    public async Task<SessionDetailDto?> Handle(GetSessionDetailsQuery request, CancellationToken ct)
    {
        var session = await _sessionRepository.GetByIdAsync(request.SessionId, ct);
        if (session == null) return null;
        
        var initiatives = session.VotingResults?.Select(vr => new VotingInfoDto(
            Id: vr.Id,
            InitiativeId: vr.InitiativeId,
            InitiativeTitle: vr.Initiative?.Title ?? "Инициатива удалена",
            Status: vr.Status.ToString(),
            IsFinalized: vr.IsFinalized,
            Votes: vr.Votes?.Select(v => new VoteDto(
                VoterId: v.VoterId,
                VoteType: v.Type.ToString(),
                VotedAt: v.VotedAt
            )).ToList() ?? new List<VoteDto>()
        )).ToList() ?? new List<VotingInfoDto>();
        
        var attendees = session.Attendees?
            .Where(a => a?.User != null)
            .Select(a => new AttendeeDto(
            Id: a!.User!.Id,
            Name: $"{a.User.LastName} {a.User.FirstName}".Trim(),
            Role: a.User.Role.Name
        )).ToList() ?? new List<AttendeeDto>();

        return new SessionDetailDto(
            Id: session.Id,
            Title: session.Title,
            HeldAt: session.HeldAt,
            Location: session.Location,
            CommitteeName: session.Committee?.Name ?? "Комиссия не указана",
            IsCompleted: session.IsCompleted,
            Initiatives: initiatives,
            Attendees: attendees
        );
    }
}