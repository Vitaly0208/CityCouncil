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
}