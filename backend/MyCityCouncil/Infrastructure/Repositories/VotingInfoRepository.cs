using Microsoft.EntityFrameworkCore;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;
using MyCityCouncil.Infrastructure.Persistence;

namespace MyCityCouncil.Infrastructure.Repositories;

public class VotingRepository : IVotingRepository
{
    private readonly AppDbContext _dbContext;

    public VotingRepository(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task AddAsync(VotingInfo votingInfo, CancellationToken ct = default)
    {
        await _dbContext.VotingInfos.AddAsync(votingInfo, ct);
    }

    public async Task SaveChangesAsync(CancellationToken ct = default)
    {
        await _dbContext.SaveChangesAsync(ct);
    }
    public void Update(VotingInfo votingInfo) 
        => _dbContext.VotingInfos.Update(votingInfo);
    
    public async Task<VotingInfo?> GetBySessionAndInitiativeAsync(Guid sessionId, Guid initiativeId, CancellationToken ct = default)
        => await _dbContext.VotingInfos
            .Include(vi => vi.Initiative)
            .Include(vi => vi.Votes) 
            .FirstOrDefaultAsync(vi => vi.SessionId == sessionId && vi.InitiativeId == initiativeId, ct);
    
    public async Task<List<VotingInfo>> GetBySessionIdAsync(Guid sessionId, CancellationToken ct = default)
        => await _dbContext.VotingInfos
            .Where(vi => vi.SessionId == sessionId)
            .ToListAsync(ct);
    
    public async Task<List<VotingInfo>> GetBySessionIdWithInitiativesAsync(Guid sessionId, CancellationToken ct = default)
    {
        return await _dbContext.VotingInfos
            .Include(vi => vi.Initiative)
            .Where(vi => vi.SessionId == sessionId)
            .ToListAsync(ct);
    }
}