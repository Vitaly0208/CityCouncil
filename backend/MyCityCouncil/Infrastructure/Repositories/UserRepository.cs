using Microsoft.EntityFrameworkCore;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;
using MyCityCouncil.Infrastructure.Persistence;

namespace MyCityCouncil.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _dbContext;
    
    public  UserRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default) => 
        await _dbContext.Users.AnyAsync(u => u.Email == email, ct);

    public async Task AddAsync(User user, CancellationToken ct = default)
    {
        await _dbContext.Users.AddAsync(user, ct);
    }

    public async Task<User?> GetByIdAsync(Guid id,  CancellationToken ct = default) =>
        await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
    
    public async Task<User?> GetByEmailAsync(string email,  CancellationToken ct = default) =>
        await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email, ct);
    
    public async Task<List<User>> GetAllAsync(CancellationToken ct = default) =>
        await _dbContext.Users
            .Include(u => u.Role)
            .Include(u => u.CommitteesMemberships)
                .ThenInclude(cm => cm.Committee)
            .AsNoTracking()
            .ToListAsync(ct);

    public async Task<List<User>> GetByCommitteeIdAsync(Guid committeeId, CancellationToken ct = default) =>
        await _dbContext.Users
            .Include(u => u.Role)
            .Include(u => u.CommitteesMemberships)
            .ThenInclude(cm => cm.Committee)
            .Where(u => u.CommitteesMemberships.Any(cm => 
                cm.CommitteeId == committeeId && 
                cm.DismissedAt == null))
            .AsNoTracking()
            .ToListAsync(ct);

    public async Task<List<User>> SearchAsync(string searchTerm, CancellationToken ct = default) =>
        await _dbContext.Users
            .Include(u => u.Role)
            .Where(u => 
                u.FirstName.Contains(searchTerm) || 
                u.LastName.Contains(searchTerm) || 
                u.Email.Contains(searchTerm))
            .AsNoTracking()
            .ToListAsync(ct);
    
    public async Task<bool> HasActivePartyAsync(Guid userId, CancellationToken ct = default) =>
        await _dbContext.PartiesInfos.AnyAsync(p => p.UserId == userId && p.DismissedAt == null, ct);
    
    public async Task<User?> GetByIdWithRelationsAsync(Guid id, CancellationToken ct = default) =>
        await _dbContext.Users
            .Include(u => u.Role)
            .Include(u => u.CommitteesMemberships).ThenInclude(cm => cm.Committee)
            .Include(u => u.PartyMemberships).ThenInclude(pm => pm.Party)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id, ct);
    
    public async Task UpdateAsync(User user, CancellationToken ct = default)
    {
        _dbContext.Users.Update(user);
        await Task.CompletedTask;
    }
    public async Task<List<User>> GetAllFilteredAsync(
        string? searchTerm,
        string? role,
        Guid? committeeId,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = _dbContext.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var q = searchTerm.ToLower();
            query = query.Where(u => 
                u.FirstName.ToLower().Contains(q) ||
                u.LastName.ToLower().Contains(q) ||
                (u.MiddleName != null && u.MiddleName.ToLower().Contains(q)) ||
                u.Email.ToLower().Contains(q)
            );
        }

        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(u => u.Role != null && u.Role.Name == role);

        if (committeeId.HasValue)
        {
            query = query.Where(u => u.CommitteesMemberships.Any(m => 
                m.CommitteeId == committeeId.Value && m.DismissedAt == null));
        }

        return await query
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }
}