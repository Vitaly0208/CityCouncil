using Microsoft.EntityFrameworkCore;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;
using MyCityCouncil.Infrastructure.Persistence;

namespace MyCityCouncil.Infrastructure.Repositories;

public class SessionRepository : ISessionRepository
{
    private readonly AppDbContext _dbContext;

    public SessionRepository(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task AddAsync(Session session, CancellationToken ct = default) =>
        await _dbContext.Sessions.AddAsync(session, ct);

    public async Task<Session?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _dbContext.Sessions
            .Include(s => s.Committee)
            .FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<List<Session>> GetAllAsync(CancellationToken ct = default) =>
        await _dbContext.Sessions
            .AsNoTracking()
            .Include(s => s.Committee)
            .ToListAsync(ct);

    public async Task<List<Session>> GetByCommitteeIdAsync(Guid committeeId, CancellationToken ct = default) =>
        await _dbContext.Sessions
            .AsNoTracking()
            .Where(s => s.CommitteeId == committeeId)
            .OrderByDescending(s => s.HeldAt)
            .ToListAsync(ct);

    public async Task<List<Session>> GetUpcomingAsync(DateTime from, CancellationToken ct = default) =>
        await _dbContext.Sessions
            .AsNoTracking()
            .Where(s => s.HeldAt >= from)
            .OrderBy(s => s.HeldAt)
            .ToListAsync(ct);

    public void Update(Session session) => _dbContext.Sessions.Update(session);
    public void Delete(Session session) => _dbContext.Sessions.Remove(session);

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default) =>
        await _dbContext.Sessions.AnyAsync(s => s.Id == id, ct);

    public async Task SaveChangesAsync(CancellationToken ct = default) =>
        await _dbContext.SaveChangesAsync(ct);
}