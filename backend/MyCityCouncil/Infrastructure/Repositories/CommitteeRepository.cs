using Microsoft.EntityFrameworkCore;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;
using MyCityCouncil.Infrastructure.Persistence;

namespace MyCityCouncil.Infrastructure.Repositories;

public class CommitteeRepository : ICommitteeRepository
{
    private readonly AppDbContext _dbContext;
    
    public CommitteeRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> ExistsByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _dbContext.Committees.AnyAsync(c => c.Id == id, ct);
    }

    public async Task<bool> ExistsByNameAsync(string name, CancellationToken ct = default)
    {
        return await _dbContext.Committees.AnyAsync(c => c.Name == name, ct);
    }

    public async Task AddAsync(Committee committee, CancellationToken ct = default)
    {
        await _dbContext.Committees.AddAsync(committee, ct);
    }

    public async Task<Committee?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _dbContext.Committees.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Id == id, ct);
    }

    public void Update(Committee committee, CancellationToken ct = default)
    {
        _dbContext.Committees.Update(committee);
    }

    public void Delete(Committee committee)
    {
        _dbContext.Committees.Remove(committee);
    }

    public async Task<List<Committee>> GetAllAsync(CancellationToken ct = default) => 
        await _dbContext.Committees
            .Where(c => !c.IsArchived)
            .ToListAsync(ct);

    public async Task<List<Committee>> GetBySpecializationAsync(string specialization, CancellationToken ct = default) =>
        await _dbContext.Committees
            .Where(c => c.Specialization == specialization && !c.IsArchived)
            .ToListAsync(ct);

    public async Task<List<CommitteeInfo>> GetActiveMembersAsync(Guid committeeId, CancellationToken ct = default) => 
        await _dbContext.CommitteeInfos
            .Where(c => c.CommitteeId == committeeId
                && c.DismissedAt == null
                && c.CStatus == Statuses.Active)
            .Include(m => m.User)
            .OrderBy(m => m.IsChairman ? 0 : 1)
            .ThenBy(m => m.User.LastName)
            .ToListAsync(ct);
    
    public async Task<CommitteeInfo?> GetCurrentChairmanAsync(Guid committeeId, CancellationToken ct = default) =>
        await _dbContext.CommitteeInfos
            .FirstOrDefaultAsync(c => c.CommitteeId == committeeId 
                                      && c.IsChairman 
                                      && c.CStatus == Statuses.Active
                                      && c.DismissedAt == null, ct);
    
    public async Task<List<CommitteeInfo>> GetHistoryAsync(Guid committeeId, int yearsBack = 10, CancellationToken ct = default)
    {
        var cutoffDate = DateTime.UtcNow.AddYears(-yearsBack);
        
        return await _dbContext.CommitteeInfos
            .Where(m => m.CommitteeId == committeeId 
                        && m.AppointedAt >= cutoffDate)
            .Include(m => m.User)
            .OrderByDescending(m => m.AppointedAt)
            .ToListAsync(ct);
    }
    
    public async Task<List<CommitteeInfo>> GetAllMembershipsAsync(Guid committeeId, CancellationToken ct = default) =>
        await _dbContext.CommitteeInfos
            .Where(m => m.CommitteeId == committeeId)
            .Include(m => m.User)
            .OrderByDescending(m => m.AppointedAt)
            .ToListAsync(ct);

    public async Task<CommitteeInfo> AddMemberAsync(Guid committeeId, Guid userId, bool isChairman, CancellationToken ct = default)
    {
        if (await IsUserActiveMemberAsync(committeeId, userId, ct))
            throw new InvalidOperationException($"User {userId} is already an active member of committee {committeeId}");
        
        if (isChairman && await HasActiveChairmanAsync(committeeId, ct))
            throw new InvalidOperationException($"Committee {committeeId} already has an active chairman");

        var membership = new CommitteeInfo
        {
            CommitteeId = committeeId,
            UserId = userId,
            IsChairman = isChairman,
            AppointedAt = DateTime.UtcNow,
            CStatus = Statuses.Active
        };
        
        await _dbContext.CommitteeInfos.AddAsync(membership, ct);
        return membership;
    }
    
    public async Task<CommitteeInfo> AppointChairmanAsync(Guid committeeId, Guid userId, CancellationToken ct = default)
    {
        if (!await IsUserActiveMemberAsync(committeeId, userId, ct))
            throw new InvalidOperationException($"User {userId} is not an active member of committee {committeeId}");
        
        if (await HasActiveChairmanAsync(committeeId, ct))
        {
            var current = await GetCurrentChairmanAsync(committeeId, ct);
            throw new InvalidOperationException(
                $"Committee {committeeId} already has an active chairman: {current?.User?.LastName}");
        }
        
        var membership = await _dbContext.CommitteeInfos
            .FirstAsync(m => m.CommitteeId == committeeId 
                             && m.UserId == userId 
                             && m.DismissedAt == null, ct);

        membership.IsChairman = true;
        _dbContext.CommitteeInfos.Update(membership);
    
        return membership;
    }
    
    public async Task<bool> DismissChairmanAsync(Guid committeeId, CancellationToken ct = default)
    {
        var chairman = await GetCurrentChairmanAsync(committeeId, ct);
        if (chairman is null) return false;

        chairman.IsChairman = false;
        _dbContext.CommitteeInfos.Update(chairman);
    
        return true;
    }
    
    public async Task<CommitteeInfo> TransferChairmanshipAsync(Guid committeeId, Guid newChairmanId, CancellationToken ct = default)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
    
        try
        {
            await DismissChairmanAsync(committeeId, ct);
            
            var newChairman = await AppointChairmanAsync(committeeId, newChairmanId, ct);
        
            await transaction.CommitAsync(ct);
            return newChairman;
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }
    
    public async Task<CommitteeInfo?> DismissMemberAsync(Guid committeeId, Guid userId, CancellationToken ct = default)
    {
        var membership = await _dbContext.CommitteeInfos
            .FirstOrDefaultAsync(m => m.CommitteeId == committeeId 
                                      && m.UserId == userId 
                                      && m.DismissedAt == null 
                                      && m.CStatus == Statuses.Active, ct);
        if (membership is null) return null;

        membership.DismissedAt = DateTime.UtcNow;
        membership.CStatus = Statuses.Archived;
        membership.IsChairman = false;
        
        _dbContext.CommitteeInfos.Update(membership);
        return membership;
    }
    
    public async Task<List<CommitteeInfo>> GetUserCommitteeHistoryAsync(Guid userId, CancellationToken ct = default)
    {
        return await _dbContext.CommitteeInfos
            .Where(m => m.UserId == userId)
            .Include(m => m.Committee)
            .OrderByDescending(m => m.AppointedAt)
            .ToListAsync(ct);
    }
    
    public async Task<List<CommitteeInfo>> GetUserActiveCommitteesAsync(Guid userId, CancellationToken ct = default)
    {
        return await _dbContext.CommitteeInfos
            .Where(m => m.UserId == userId 
                        && m.DismissedAt == null 
                        && m.CStatus == Statuses.Active)
            .Include(m => m.Committee)
            .OrderByDescending(m => m.AppointedAt)
            .ToListAsync(ct);
    }
    
    public async Task<bool> IsUserActiveMemberAsync(Guid committeeId, Guid userId, CancellationToken ct = default) =>
        await _dbContext.CommitteeInfos.AnyAsync(m => 
            m.CommitteeId == committeeId 
            && m.UserId == userId 
            && m.DismissedAt == null 
            && m.CStatus == Statuses.Active, ct);
    
    public async Task<bool> HasActiveChairmanAsync(Guid committeeId, CancellationToken ct = default) =>
        await _dbContext.CommitteeInfos.AnyAsync(m => 
            m.CommitteeId == committeeId 
            && m.IsChairman 
            && m.DismissedAt == null 
            && m.CStatus == Statuses.Active, ct);
    
    public async Task<bool> IsCurrentChairmanAsync(Guid committeeId, Guid userId, CancellationToken ct = default) =>
        await _dbContext.CommitteeInfos.AnyAsync(m => 
            m.CommitteeId == committeeId 
            && m.UserId == userId 
            && m.IsChairman 
            && m.DismissedAt == null 
            && m.CStatus == Statuses.Active, ct);
    
    public async Task<bool> ArchiveAsync(Guid committeeId, CancellationToken ct = default)
    {
        var committee = await _dbContext.Committees.FindAsync( committeeId, ct);
        if (committee is null || committee.IsArchived) return false;

        committee.IsArchived = true;
        committee.ArchivedAt = DateTime.UtcNow;
        _dbContext.Committees.Update(committee);
        return true;
    }
}
