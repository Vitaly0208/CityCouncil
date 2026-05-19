using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Sessions.Finalize;

public class FinalizeSessionHandler : IRequestHandler<FinalizeSessionCommand, Unit>
{
    private readonly ISessionRepository _sessionRepo;
    private readonly IVotingRepository _votingRepo;
    private readonly IVoteRepository _voteRepo;
    private readonly IUnitOfWork _uow;

    public FinalizeSessionHandler(
        ISessionRepository sessionRepo,
        IVotingRepository votingRepo,
        IVoteRepository voteRepo,
        IUnitOfWork uow)
    {
        _sessionRepo = sessionRepo;
        _votingRepo = votingRepo;
        _voteRepo = voteRepo;
        _uow = uow;
    }

    public async Task<Unit> Handle(FinalizeSessionCommand request, CancellationToken ct)
    {
        // 1. Загружаем сессию (без VotingResults!)
        var session = await _sessionRepo.GetByIdAsync(request.SessionId, ct);
        if (session == null || session.IsCompleted)
            throw new InvalidOperationException("Сессия не найдена или уже закрыта");

        // 2. Загружаем VotingInfo с инициативами (через Include)
        var votingInfos = await _votingRepo.GetBySessionIdWithInitiativesAsync(request.SessionId, ct);
        
        foreach (var vi in votingInfos)
        {
            if (vi.IsFinalized) continue;

            var votes = await _voteRepo.GetByVotingInfoIdAsync(vi.Id, ct);
            var forCount = votes.Count(v => v.Type == VoteType.For);
            var againstCount = votes.Count(v => v.Type == VoteType.Against);
            var totalValid = forCount + againstCount;

            var isAccepted = totalValid > 0 && forCount > totalValid / 2.0;
            var newStatus = isAccepted ? InitiativeStatus.Accepted : InitiativeStatus.Rejected;

            // 3. Обновляем инициативу (уже tracked через Include)
            if (vi.Initiative != null)
            {
                vi.Initiative.Status = newStatus;
                // ❌ НЕ вызываем _initRepo.Update()
            }

            // 4. Обновляем VotingInfo (уже tracked)
            vi.Status = newStatus;
            vi.IsFinalized = true;
            // ❌ НЕ вызываем _votingRepo.Update()
        }

        // 5. Обновляем сессию
        session.IsCompleted = true;
        
        // 👇 ВАЖНО: вызываем Update() ТОЛЬКО если сессия НЕ отслеживается
        // Если GetByIdAsync использует .AsNoTracking() — раскомментируй:
        // _sessionRepo.Update(session);
        // Если нет .AsNoTracking() — не вызывай Update(), EF сам увидит изменения

        // 6. Сохраняем всё одной транзакцией
        await _uow.SaveAsync(ct);

        return Unit.Value;
    }
}