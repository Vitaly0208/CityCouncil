using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Sessions.Finalize;

public class FinalizeSessionHandler : IRequestHandler<FinalizeSessionCommand, FinalizeSessionResult>
{
    private readonly ISessionRepository _sessionRepo;
    private readonly IInitiativeRepository _initiativeRepo;
    private readonly IVotingRepository _votingRepo;
    private readonly ICommitteeRepository _committeeRepo;
    private readonly IUnitOfWork _uow;

    public FinalizeSessionHandler(ISessionRepository sessionRepo, IInitiativeRepository initiativeRepo, 
                                  IVotingRepository votingRepo, ICommitteeRepository committeeRepo, IUnitOfWork uow)
    {
        _sessionRepo = sessionRepo; _initiativeRepo = initiativeRepo;
        _votingRepo = votingRepo; _committeeRepo = committeeRepo; _uow = uow;
    }

    public async Task<FinalizeSessionResult> Handle(FinalizeSessionCommand request, CancellationToken ct)
    {
        var session = await _sessionRepo.GetByIdAsync(request.SessionId, ct)
            ?? throw new KeyNotFoundException("Заседание не найдено");

        if (session.IsCompleted) return new FinalizeSessionResult(false, null);

        session.IsCompleted = true;
        session.FinalizedAt = DateTime.UtcNow;
        _sessionRepo.Update(session);

        var initiativesForNextRound = new List<Initiative>();

        foreach (var votingInfo in session.VotingResults)
        {
            var init = votingInfo.Initiative;
            
            if (session.HearingRound == 1)
            {
                init.Status = InitiativeStatus.InSecondHearing;
                initiativesForNextRound.Add(init);
            }
            else if (session.HearingRound == 2)
            {
                var totalFor = await _votingRepo.CountVotesAsync(init.Id, VoteType.For, ct);
                var totalAgainst = await _votingRepo.CountVotesAsync(init.Id, VoteType.Against, ct);
                
                init.Status = totalFor > totalAgainst ? InitiativeStatus.Accepted : InitiativeStatus.Rejected;
                init.FinalizedAt = DateTime.UtcNow;
            }
            
            votingInfo.IsFinalized = true;
            votingInfo.Status = init.Status;
            _votingRepo.Update(votingInfo);
            _initiativeRepo.Update(init);
        }
        
        Guid? nextSessionId = null;
        if (session.HearingRound == 1 && initiativesForNextRound.Any())
        {
            var committee = await _committeeRepo.GetByIdAsync(session.CommitteeId, ct);
            var round2Session = new Session
            {
                CommitteeId = session.CommitteeId,
                Title = $"{session?.Title ?? "Комиссия"} (2 слушание)",
                HeldAt = session.HeldAt.AddDays(7),
                Location = session.Location,
                HearingRound = 2,
                CreatedAt = DateTime.UtcNow
            };

            await _sessionRepo.AddAsync(round2Session, ct);

            foreach (var init in initiativesForNextRound)
            {
                var votingInfo = new VotingInfo
                {
                    SessionId = round2Session.Id,
                    InitiativeId = init.Id,
                    SessionTitle = round2Session.Title,
                    InitiativeTitle = init.Title,
                    InitiativeDescription = init.Description,
                    InitiativeAuthor = $"{init.User?.LastName} {init.User?.FirstName}".Trim(),
                    InitiativeCreatedAt = init.CreatedAt,
                    Status = init.Status,
                    HearingRound = 2
                };
                await _votingRepo.AddAsync(votingInfo, ct);
            }
            nextSessionId = round2Session.Id;
        }

        await _uow.SaveAsync(ct);
        return new FinalizeSessionResult(true, nextSessionId);
    }
}