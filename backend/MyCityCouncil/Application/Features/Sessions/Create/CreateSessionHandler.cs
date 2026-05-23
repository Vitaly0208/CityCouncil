using MediatR;
using Microsoft.Extensions.Logging;
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
        var topInitiatives = await _initiativeRepository.GetTopQueueInitiativesAsync(3, ct);
        var session = new Session
        {
            CommitteeId = request.CommitteeId,
            Title = request.Title,
            HeldAt = request.HeldAt,
            Location = request.Location,
            CreatedAt = DateTime.UtcNow
        };

        await _sessionRepository.AddAsync(session, ct);
        var committee = await _committeeRepository.GetByIdAsync(request.CommitteeId, ct);
        var assignedIds = new List<Guid>();
        
        if (topInitiatives.Any())
        {
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
                    Status = initiative.Status,
                };
                
                await _votingRepository.AddAsync(votingInfo, ct);
                assignedIds.Add(initiative.Id);
            }
        }

        await _uow.SaveAsync(ct);

        return new SessionDto(
            Id: session.Id,
            Title: session.Title,
            HeldAt: session.HeldAt,
            Location: session.Location,
            CommitteeId: session.CommitteeId,
            CommitteeName: committee.Name,
            IsCompleted: session.IsCompleted,
            InitiativeIds: assignedIds
        );
    }
}