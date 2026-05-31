using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Domain.Interfaces;

public interface ISessionRepository
{
    Task AddAsync(Session session, CancellationToken ct = default);
    Task<Session?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<Session>> GetAllAsync(CancellationToken ct = default);
    Task<List<Session>> GetByCommitteeIdAsync(Guid committeeId, CancellationToken ct = default);
    Task<List<Session>> GetUpcomingAsync(DateTime from, CancellationToken ct = default);
    Task<List<Session>> GetSessionsByUserCommitteesAsync(Guid userId, CancellationToken ct = default);
    
    void Update(Session session);
    void Delete(Session session);
    
    Task<bool> ExistsAsync(Guid id, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}