using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Domain.Interfaces;

public interface IPartyRepository
{
    Task AddAsync(Party party, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<List<Party>> GetAllAsync(CancellationToken ct = default);
    Task<List<Party>> GetUserPartiesAsync(Guid userId, CancellationToken ct = default);
    Task<PartiesInfo> AddMemberAsync(Guid partyId, Guid userId, CancellationToken ct = default);
    Task<bool> RemoveMemberAsync(Guid partyId, Guid userId, CancellationToken ct = default);
    Task<bool> ExistsByNameAsync(string name, CancellationToken ct = default);
    Task<Party?> GetByIdAsync(Guid id, CancellationToken ct = default);
}