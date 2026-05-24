using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Domain.Interfaces;

public interface IUserRepository
{
    Task<bool> ExistsByEmailAsync(string email,  CancellationToken ct = default);
    Task AddAsync(User user, CancellationToken ct = default);
    Task<User?> GetByIdAsync(Guid id,  CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email,  CancellationToken ct = default);
    
    Task<List<User>> GetAllAsync(CancellationToken ct = default);
    Task<List<User>> GetByCommitteeIdAsync(Guid committeeId, CancellationToken ct = default);
    Task<List<User>> SearchAsync(string searchTerm, CancellationToken ct = default);
}