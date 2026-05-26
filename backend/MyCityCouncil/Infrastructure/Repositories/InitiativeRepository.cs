using Microsoft.EntityFrameworkCore;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;
using MyCityCouncil.Infrastructure.Persistence;

namespace MyCityCouncil.Infrastructure.Repositories;

public class InitiativeRepository : IInitiativeRepository
{
    private readonly AppDbContext _dbContext;

    public InitiativeRepository(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task AddAsync(Initiative initiative, CancellationToken ct = default) =>
        await _dbContext.Initiatives.AddAsync(initiative, ct);

    public async Task<Initiative?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _dbContext.Initiatives
            .AsNoTracking()
            .Include(i => i.User)
            .Include(i => i.VotingHistory)
            .FirstOrDefaultAsync(i => i.Id == id, ct);

    public async Task<List<Initiative>> GetAllAsync(CancellationToken ct = default) =>
        await _dbContext.Initiatives
            .AsNoTracking()
            .Include(i => i.User)
            .ToListAsync(ct);

    public void Update(Initiative initiative) => _dbContext.Initiatives.Update(initiative);
    public void Delete(Initiative initiative) => _dbContext.Initiatives.Remove(initiative);

    public async Task<List<Initiative>> GetByUserIdAsync(Guid userId, CancellationToken ct = default) =>
        await _dbContext.Initiatives
            .AsNoTracking()
            .Where(i => i.UserId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(ct);

    public async Task<List<Initiative>> GetByStatusAsync(InitiativeStatus status, CancellationToken ct = default) =>
        await _dbContext.Initiatives
            .AsNoTracking()
            .Include(i => i.User)
            .Where(i => i.Status == status)
            .OrderByDescending(i => i.ApprovedAt ?? i.CreatedAt)
            .ToListAsync(ct);
    
    public async Task<List<Initiative>> GetQueueAsync(int limit = 25, CancellationToken ct = default) =>
        await _dbContext.Initiatives
            .AsNoTracking()
            .Where(i => i.Status == InitiativeStatus.InQueue)
            .OrderBy(i => i.ApprovedAt)
            .Take(limit)
            .ToListAsync(ct);

    public async Task<List<Initiative>> GetTopQueueInitiativesAsync(int count = 3, CancellationToken ct = default) =>
        await _dbContext.Initiatives
            .AsNoTracking()
            .Where(i => i.Status == InitiativeStatus.InQueue)
            .OrderBy(i => i.ApprovedAt)
            .Take(count)
            .ToListAsync(ct);

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default) =>
        await _dbContext.Initiatives.AnyAsync(i => i.Id == id, ct);

    public async Task SaveChangesAsync(CancellationToken ct = default) =>
        await _dbContext.SaveChangesAsync(ct);
}