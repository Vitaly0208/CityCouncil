using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Sessions.Create;

public class CreateSessionHandler : IRequestHandler<CreateSessionWithQueueCommand, SessionDto>
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IInitiativeRepository _initiativeRepository;
    private readonly IVotingRepository _votingRepository;
    private readonly ICommitteeRepository _committeeRepository;
    private readonly IUnitOfWork _uow;

    public CreateSessionHandler(
        ISessionRepository sessionRepository,
        IInitiativeRepository initiativeRepository,
        IVotingRepository votingRepository,
        ICommitteeRepository committeeRepository,
        IUnitOfWork uow)
    {
        _sessionRepository = sessionRepository;
        _initiativeRepository = initiativeRepository;
        _votingRepository = votingRepository;
        _committeeRepository = committeeRepository;
        _uow = uow;
    }

    public async Task<SessionDto> Handle(CreateSessionWithQueueCommand request, CancellationToken ct)
    {
        var topInitiatives = await _initiativeRepository.GetTopQueueByCommitteeAsync(request.CommitteeId, 3, ct);
        
        var session = new Session
        {
            CommitteeId = request.CommitteeId,
            Title = request.Title,
            HeldAt = request.HeldAt,
            Location = request.Location,
            HearingRound = 1,
            CreatedAt = DateTime.UtcNow
        };

        await _sessionRepository.AddAsync(session, ct);
        var committee = await _committeeRepository.GetByIdAsync(request.CommitteeId, ct);
        
        foreach (var initiative in topInitiatives)
        {
            initiative.Status = InitiativeStatus.InFirstHearing;
            _initiativeRepository.Update(initiative);
            
            var votingInfo = new VotingInfo
            {
                SessionId = session.Id,
                InitiativeId = initiative.Id,
                SessionTitle = session.Title,
                InitiativeTitle = initiative.Title,
                InitiativeDescription = initiative.Description,
                InitiativeAuthor = $"{initiative.User?.LastName} {initiative.User?.FirstName} {initiative.User?.MiddleName}".Trim(),
                InitiativeCreatedAt = initiative.CreatedAt,
                Status = initiative.Status,
                HearingRound = 1
            };
            
            await _votingRepository.AddAsync(votingInfo, ct);
        }

        await _uow.SaveAsync(ct);

        return new SessionDto(
            Id: session.Id,
            Title: session.Title,
            HeldAt: session.HeldAt,
            Location: session.Location,
            CommitteeId: session.CommitteeId,
            CommitteeName: committee?.Name ?? string.Empty,
            IsCompleted: session.IsCompleted,
            HearingRound: session.HearingRound,
            Initiatives: new List<VotingInfoDto>()
        );
    }
}