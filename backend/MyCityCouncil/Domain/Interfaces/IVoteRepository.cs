using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Domain.Interfaces;

public interface IVoteRepository
{
    Task<bool> HasVotedAsync(Guid votingInfoId, Guid voterId, CancellationToken ct = default);
    Task AddAsync(Vote vote, CancellationToken ct = default);
    Task<List<Vote>> GetByVotingInfoIdAsync(Guid votingInfoId, CancellationToken ct = default);
}