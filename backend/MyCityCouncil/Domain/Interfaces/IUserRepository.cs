using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Domain.Interfaces;

public interface IUserRepository
{
    Task<bool> ExistsByEmailAsync(string email,  CancellationToken ct = default);
    Task AddAsync(User user, CancellationToken ct = default);
    Task<User?> GetByIdAsync(Guid id,  CancellationToken ct = default);
    Task UpdateAsync(User user, CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email,  CancellationToken ct = default);
    
    Task<List<User>> GetAllAsync(CancellationToken ct = default);
    Task<List<User>> GetByCommitteeIdAsync(Guid committeeId, CancellationToken ct = default);

    Task<bool> HasActivePartyAsync(Guid userId, CancellationToken ct = default);
    Task<User?> GetByIdWithRelationsAsync(Guid id, CancellationToken ct = default);
    string? GetCurrentPartyName(User user);
    List<string> GetActiveCommitteeNames(User user);
    Task<List<User>> GetAllFilteredAsync(
        string? searchTerm,
        string? role,
        Guid? committeeId,
        int page,
        int pageSize,
        CancellationToken ct = default);
}