using Microsoft.EntityFrameworkCore;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;
using MyCityCouncil.Infrastructure.Persistence;

namespace MyCityCouncil.Infrastructure.Repositories;

public class VoteRepository : IVoteRepository
{
    private readonly AppDbContext _dbContext;
    public VoteRepository(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task<bool> HasVotedAsync(Guid votingInfoId, Guid voterId, CancellationToken ct = default)
        => await _dbContext.Votes.AnyAsync(v => v.VotingInfoId == votingInfoId && v.VoterId == voterId, ct);

    public async Task AddAsync(Vote vote, CancellationToken ct = default)
        => await _dbContext.Votes.AddAsync(vote, ct);

    public async Task<List<Vote>> GetByVotingInfoIdAsync(Guid votingInfoId, CancellationToken ct = default)
        => await _dbContext.Votes.Where(v => v.VotingInfoId == votingInfoId).ToListAsync(ct);
}