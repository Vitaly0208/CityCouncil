using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Voting.CastVote;

public class CastVoteHandler : IRequestHandler<CastVoteCommand, Unit>
{
    private readonly ISessionRepository _sessionRepo;
    private readonly IVotingRepository _votingRepo;
    private readonly IVoteRepository _voteRepo;
    private readonly IUnitOfWork _uow;

    public CastVoteHandler(
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

    public async Task<Unit> Handle(CastVoteCommand request, CancellationToken ct)
    {
        var session = await _sessionRepo.GetByIdAsync(request.SessionId, ct);
        if (session == null || session.IsCompleted)
            throw new InvalidOperationException("Сессия не найдена или уже завершена");

        var votingInfo = await _votingRepo.GetBySessionAndInitiativeAsync(request.SessionId, request.InitiativeId, ct);
        if (votingInfo == null)
            throw new InvalidOperationException("Инициатива отсутствует в повестке сессии");

        if (votingInfo.IsFinalized)
            throw new InvalidOperationException("Голосование по данной инициативе уже закрыто");

        if (await _voteRepo.HasVotedAsync(votingInfo.Id, request.VoterId, ct))
            throw new InvalidOperationException("Вы уже голосовали по этой инициативе");

        var vote = new Vote
        {
            VotingInfoId = votingInfo.Id,
            VoterId = request.VoterId,
            Type = request.VoteType,
            VotedAt = DateTime.UtcNow
        };

        await _voteRepo.AddAsync(vote, ct);
        await _uow.SaveAsync(ct);
        return Unit.Value;
    }
}