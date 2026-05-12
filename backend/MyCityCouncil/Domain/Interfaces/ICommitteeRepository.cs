using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Domain.Interfaces;

public interface ICommitteeRepository
{
    Task<bool>? ExistsByIdAsync(Guid id,  CancellationToken ct = default);
    Task<bool> ExistsByNameAsync(string name, CancellationToken ct = default);
    Task AddAsync(Committee committee, CancellationToken ct = default);
    void Update(Committee committee, CancellationToken ct = default);
    void Delete(Committee committee);
    Task<Committee?> GetByIdAsync(Guid id,  CancellationToken ct = default);
    Task<List<Committee>> GetAllAsync(CancellationToken ct = default);
    
    
    Task<List<Committee>> GetBySpecializationAsync(string specialization, CancellationToken ct = default);
    Task<List<CommitteeInfo>> GetActiveMembersAsync(Guid committeeId, CancellationToken ct = default);
    Task<CommitteeInfo?> GetCurrentChairmanAsync(Guid committeeId, CancellationToken ct = default);
    Task<List<CommitteeInfo>> GetHistoryAsync(
        Guid committeeId, 
        int yearsBack = 10, 
        CancellationToken ct = default);
    Task<List<CommitteeInfo>> GetAllMembershipsAsync(Guid committeeId, CancellationToken ct = default);
    
    
    Task<CommitteeInfo> AddMemberAsync(
        Guid committeeId, 
        Guid userId, 
        bool isChairman,
        CancellationToken ct = default);
    
    Task<List<CommitteeInfo>> GetUserCommitteeHistoryAsync(
        Guid userId, 
        CancellationToken ct = default);
    
    Task<List<CommitteeInfo>> GetUserActiveCommitteesAsync(
        Guid userId, 
        CancellationToken ct = default);

    Task<CommitteeInfo> AppointChairmanAsync(Guid committeeId, Guid userId, CancellationToken ct = default);
    
    Task<CommitteeInfo?> DismissMemberAsync(Guid committeeId, Guid userId, CancellationToken ct = default);

    Task<bool> DismissChairmanAsync(Guid committeeId, CancellationToken ct = default);
    
    Task<CommitteeInfo> TransferChairmanshipAsync(Guid committeeId, Guid newChairmanId, CancellationToken ct = default);

    Task<bool> IsCurrentChairmanAsync(Guid committeeId, Guid userId, CancellationToken ct = default);
    
    Task<bool> IsUserActiveMemberAsync(Guid committeeId, Guid userId, CancellationToken ct = default);
    
    Task<bool> HasActiveChairmanAsync(Guid committeeId, CancellationToken ct = default);
    
    Task<bool> ArchiveAsync(Guid committeeId, CancellationToken ct = default);
    
}