using Microsoft.EntityFrameworkCore;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;
using MyCityCouncil.Infrastructure.Persistence;

namespace MyCityCouncil.Infrastructure.Repositories;

public class RoleRepository : IRoleRepository
{
    private readonly AppDbContext _dbContext;

    public RoleRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Role?> GetRoleById(Guid id, CancellationToken ct = default)
    {
        return await _dbContext.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id, ct);
    }

    public async Task<Role?> GetRoleByName(string name, CancellationToken ct = default)
    {
        return await _dbContext.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Name == name, ct);
    }
}