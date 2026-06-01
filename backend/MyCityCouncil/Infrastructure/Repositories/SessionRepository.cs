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
            .Include(s => s.VotingResults)
                .ThenInclude(vr => vr.Initiative)
            .Include(s => s.VotingResults)
                .ThenInclude(vr => vr.Votes)
                    .ThenInclude(v => v.Voter)
            .Include(s => s.Attendees)
                .ThenInclude(a => a.User)
                    .ThenInclude(u => u.Role)
            .FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<List<Session>> GetAllAsync(CancellationToken ct = default) =>
        await _dbContext.Sessions
            .AsNoTracking()
            .Include(s => s.Committee)
            .Include(s => s.VotingResults)
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
    
    public async Task<List<Session>> GetSessionsByUserCommitteesAsync(Guid userId, CancellationToken ct = default)
    {
        var committeeIds = await _dbContext.CommitteeInfos
            .Where(m => m.UserId == userId && m.DismissedAt == null)
            .Select(m => m.CommitteeId)
            .ToListAsync(ct);

        if (!committeeIds.Any()) return new List<Session>();

        return await _dbContext.Sessions
            .AsNoTracking()
            .Where(s => committeeIds.Contains(s.CommitteeId))
            .Include(s => s.Committee)
            .Include(s => s.Attendees)
            .OrderByDescending(s => s.HeldAt)
            .ToListAsync(ct);
    }

    public void Update(Session session) => _dbContext.Sessions.Update(session);
    public void Delete(Session session) => _dbContext.Sessions.Remove(session);

    public async Task<bool> ExistsAsync(Guid id, CancellationToken ct = default) =>
        await _dbContext.Sessions.AnyAsync(s => s.Id == id, ct);

    public async Task SaveChangesAsync(CancellationToken ct = default) =>
        await _dbContext.SaveChangesAsync(ct);
    
    public async Task<List<Session>> GetSessionsAfterCommitteeJoinAsync(Guid userId, CancellationToken ct = default)
    {
        return await _dbContext.Sessions
            .AsNoTracking()
            .Include(s => s.Committee)
            // 👇 Убрали .Include(s => s.Attendees) — не нужно для подзапроса
            .Where(s => _dbContext.CommitteeInfos.Any(cm =>
                cm.UserId == userId &&
                cm.CommitteeId == s.CommitteeId &&
                cm.DismissedAt == null &&
                s.HeldAt >= cm.AppointedAt))
            .Select(s => new Session // 👈 Временная проекция для вычисления WasAttended
            {
                Id = s.Id,
                Title = s.Title,
                HeldAt = s.HeldAt,
                CommitteeId = s.CommitteeId,
                Committee = s.Committee,
                // 👇 Вычисляем WasAttended через подзапрос к БД
                Attendees = _dbContext.SessionAttendees
                    .Where(a => a.SessionId == s.Id && a.UserId == userId)
                    .ToList()
            })
            .OrderByDescending(s => s.HeldAt)
            .ToListAsync(ct);
    }
}