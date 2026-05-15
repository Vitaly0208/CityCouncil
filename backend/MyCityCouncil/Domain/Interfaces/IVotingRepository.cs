using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Domain.Interfaces;

public interface IVotingRepository
{
    Task AddAsync(VotingInfo votingInfo, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}