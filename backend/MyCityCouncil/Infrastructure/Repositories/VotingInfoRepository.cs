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
}