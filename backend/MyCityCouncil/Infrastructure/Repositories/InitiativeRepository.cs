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
            .Include(i => i.Committee) 
            .Include(i => i.VotingHistory)
            .FirstOrDefaultAsync(i => i.Id == id, ct);

    public async Task<List<Initiative>> GetAllAsync(CancellationToken ct = default) =>
        await _dbContext.Initiatives
            .AsNoTracking()
            .Include(i => i.User)
            .Include(i => i.Committee) 
            .ToListAsync(ct);

    public void Update(Initiative initiative) => _dbContext.Initiatives.Update(initiative);
    public void Delete(Initiative initiative) => _dbContext.Initiatives.Remove(initiative);

    public async Task<List<Initiative>> GetByUserIdAsync(Guid userId, CancellationToken ct = default) =>
        await _dbContext.Initiatives
            .AsNoTracking()
            .Where(i => i.UserId == userId)
            .Include(i => i.Committee) 
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(ct);

    public async Task<List<Initiative>> GetByStatusAsync(InitiativeStatus status, CancellationToken ct = default) =>
        await _dbContext.Initiatives
            .AsNoTracking()
            .Include(i => i.Committee) 
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
    
    public async Task<List<Initiative>> GetTopQueueByCommitteeAsync(Guid committeeId, int count, CancellationToken ct = default)
    {
        var activeMemberIds = await _dbContext.CommitteeInfos
            .Where(m => m.CommitteeId == committeeId && m.DismissedAt == null)
            .Select(m => m.UserId)
            .ToListAsync(ct);

        if (!activeMemberIds.Any()) return new List<Initiative>();

        return await _dbContext.Initiatives
            .Include(i => i.User)
            .Include(i => i.Committee) 
            .Where(i => i.Status == InitiativeStatus.InQueue && activeMemberIds.Contains(i.UserId))
            .OrderBy(i => i.ApprovedAt)
            .Take(count)
            .ToListAsync(ct);
    }
    public async Task<List<Initiative>> GetAcceptedByUserIdAsync(Guid userId, CancellationToken ct = default) =>
        await _dbContext.Initiatives
            .AsNoTracking()
            .Include(i => i.Committee) 
            .Where(i => i.UserId == userId && i.Status == InitiativeStatus.Accepted)
            .OrderByDescending(i => i.ApprovedAt)
            .ToListAsync(ct);

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default) =>
        await _dbContext.Initiatives.AnyAsync(i => i.Id == id, ct);

    public async Task SaveChangesAsync(CancellationToken ct = default) =>
        await _dbContext.SaveChangesAsync(ct);
    
    public async Task<List<Initiative>> GetAllFilteredAsync(
        string? searchTerm,
        InitiativeStatus? status,
        Guid? authorId,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = _dbContext.Initiatives
            .AsNoTracking()
            .Include(i => i.User)
            .Include(i => i.Committee) 
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var q = searchTerm.ToLower();
            query = query.Where(i => 
                i.Title.ToLower().Contains(q) ||
                i.Description.ToLower().Contains(q) ||
                (i.User != null && (
                    i.User.FirstName.ToLower().Contains(q) ||
                    i.User.LastName.ToLower().Contains(q)
                ))
            );
        }

        if (status.HasValue)
            query = query.Where(i => i.Status == status.Value);

        if (authorId.HasValue)
            query = query.Where(i => i.UserId == authorId.Value);

        return await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }
}