using Microsoft.EntityFrameworkCore;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;
using MyCityCouncil.Infrastructure.Persistence;

namespace MyCityCouncil.Infrastructure.Repositories;

public class SessionAttendeeRepository : ISessionAttendeeRepository
{
    private readonly AppDbContext _dbContext;

    public SessionAttendeeRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SessionAttendee?> GetBySessionAndUserAsync(
        Guid sessionId, 
        Guid userId, 
        CancellationToken ct = default)
    {
        return await _dbContext.SessionAttendees
            .Include(sa => sa.User)
            .FirstOrDefaultAsync(sa => sa.SessionId == sessionId && sa.UserId == userId, ct);
    }

    public async Task<List<SessionAttendee>> GetBySessionAsync(
        Guid sessionId, 
        CancellationToken ct = default)
    {
        return await _dbContext.SessionAttendees
            .Include(sa => sa.User)
            .Where(sa => sa.SessionId == sessionId)
            .ToListAsync(ct);
    }

    public async Task AddAsync(SessionAttendee attendee, CancellationToken ct = default)
    {
        await _dbContext.SessionAttendees.AddAsync(attendee, ct);
    }

    public async Task<bool> IsUserAttendingAsync(
        Guid sessionId, 
        Guid userId, 
        CancellationToken ct = default)
    {
        return await _dbContext.SessionAttendees
            .AnyAsync(sa => sa.SessionId == sessionId && sa.UserId == userId, ct);
    }
}