using MediatR;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Sessions.GetAll;

public class GetAllSessionsHandler : IRequestHandler<GetAllSessionsQuery, List<SessionListDto>>
{
    private readonly ISessionRepository _sessionRepository;
    
    public GetAllSessionsHandler(ISessionRepository sessionRepository)
    {
        _sessionRepository = sessionRepository;
    }

    public async Task<List<SessionListDto>> Handle(GetAllSessionsQuery request, CancellationToken ct)
    {
        var sessions = await _sessionRepository.GetAllAsync(ct);
        
        return sessions.Select(s => new SessionListDto(
            Id: s.Id,
            Title: s.Title,
            HeldAt: s.HeldAt,
            Location: s.Location,
            CommitteeName: s.Committee?.Name ?? "Не указано",
            IsCompleted: s.IsCompleted,
            InitiativesCount: s.VotingResults?.Count ?? 0
        )).ToList();
    }
}