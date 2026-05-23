using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Domain.Interfaces;

public interface ISessionAttendeeRepository
{
    Task<SessionAttendee?> GetBySessionAndUserAsync(Guid sessionId, Guid userId, CancellationToken ct = default);
    Task<List<SessionAttendee>> GetBySessionAsync(Guid sessionId, CancellationToken ct = default);
    Task AddAsync(SessionAttendee attendee, CancellationToken ct = default);
    Task<bool> IsUserAttendingAsync(Guid sessionId, Guid userId, CancellationToken ct = default);
}