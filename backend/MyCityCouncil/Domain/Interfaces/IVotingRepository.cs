using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Domain.Interfaces;

public interface IVotingRepository
{
    Task AddAsync(VotingInfo votingInfo, CancellationToken ct = default);
    void Update(VotingInfo votingInfo);
    Task SaveChangesAsync(CancellationToken ct = default);
    Task<VotingInfo?> GetBySessionAndInitiativeAsync(Guid sessionId, Guid initiativeId, CancellationToken ct = default);
    Task<List<VotingInfo>> GetBySessionIdAsync(Guid sessionId, CancellationToken ct = default);
    Task<List<VotingInfo>> GetBySessionIdWithInitiativesAsync(Guid sessionId, CancellationToken ct = default);
    Task<int> CountVotesAsync(Guid initiativeId, VoteType type, CancellationToken ct = default);
}