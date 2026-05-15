using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Domain.Interfaces;

public interface IInitiativeRepository
{
    Task AddAsync(Initiative initiative, CancellationToken ct = default);
    Task<Initiative?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<Initiative>> GetAllAsync(CancellationToken ct = default);
    void Update(Initiative initiative);
    void Delete(Initiative initiative);
    
    Task<List<Initiative>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<List<Initiative>> GetByStatusAsync(InitiativeStatus status, CancellationToken ct = default);
    
    Task<List<Initiative>> GetQueueAsync(int limit = 25, CancellationToken ct = default);
    
    Task<List<Initiative>> GetTopQueueInitiativesAsync(int count = 3, CancellationToken ct = default);
    
    Task<bool> ExistsAsync(Guid id, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}