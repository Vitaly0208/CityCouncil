using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Domain.Interfaces;

public interface IRoleRepository
{
    Task<Role?> GetRoleByName(string roleName, CancellationToken ct  = default);
    Task<Role?> GetRoleById(Guid roleId, CancellationToken ct = default);
}