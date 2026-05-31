using Microsoft.EntityFrameworkCore;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;
using MyCityCouncil.Infrastructure.Persistence;

namespace MyCityCouncil.Infrastructure.Repositories;

public class PartyRepository : IPartyRepository
{
    private readonly AppDbContext _dbContext;

    public PartyRepository(AppDbContext dbContext) => _dbContext = dbContext;

    public async Task AddAsync(Party party, CancellationToken ct = default) =>
        await _dbContext.Parties.AddAsync(party, ct);

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var party = await _dbContext.Parties.FindAsync([id], ct)
            ?? throw new KeyNotFoundException("Party not found");
        _dbContext.Parties.Remove(party);
    }

    public async Task<List<Party>> GetAllAsync(CancellationToken ct = default) =>
        await _dbContext.Parties.ToListAsync(ct);

    public async Task<List<Party>> GetUserPartiesAsync(Guid userId, CancellationToken ct = default) =>
        await _dbContext.Parties
            .Include(p => p.Memberships)
            .Where(p => p.Memberships.Any(m => m.UserId == userId && m.DismissedAt == null))
            .ToListAsync(ct);

    public async Task<PartiesInfo> AddMemberAsync(Guid partyId, Guid userId, CancellationToken ct = default)
    {
        var exists = await _dbContext.PartiesInfos
            .AnyAsync(m => m.PartyId == partyId && m.UserId == userId && m.DismissedAt == null, ct);

        if (exists) throw new InvalidOperationException("User is already an active member");

        var membership = new PartiesInfo
        {
            Id = Guid.NewGuid(),
            PartyId = partyId,
            UserId = userId,
            AppointedAt = DateTime.UtcNow,
            DismissedAt = null,
            PStatus = "Active"
        };

        await _dbContext.PartiesInfos.AddAsync(membership, ct);
        return membership;
    }

    public async Task<bool> RemoveMemberAsync(Guid partyId, Guid userId, CancellationToken ct = default)
    {
        var membership = await _dbContext.PartiesInfos
            .FirstOrDefaultAsync(m => m.PartyId == partyId && m.UserId == userId && m.DismissedAt == null, ct);

        if (membership is null) return false;

        membership.DismissedAt = DateTime.UtcNow;
        membership.PStatus = "Archived";
        _dbContext.PartiesInfos.Update(membership);
        return true;
    }

    public async Task<bool> ExistsByNameAsync(string name, CancellationToken ct = default) =>
        await _dbContext.Parties.AnyAsync(p => p.Name == name, ct);
    
    public async Task<Party?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _dbContext.Parties
            .Include(p => p.Memberships)
            .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(p => p.Id == id, ct);
}