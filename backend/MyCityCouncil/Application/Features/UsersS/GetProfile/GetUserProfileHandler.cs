using MediatR;
using Microsoft.EntityFrameworkCore;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Infrastructure.Persistence;

namespace MyCityCouncil.Application.Features.UsersS.GetProfile;

public class GetUserProfileHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto>
{
    private readonly AppDbContext _db;

    public GetUserProfileHandler(AppDbContext db) => _db = db;

    public async Task<UserProfileDto> Handle(GetUserProfileQuery request, CancellationToken ct)
    {
        var user = await _db.Users
            .Include(u => u.Role)
            .Include(u => u.CommitteesMemberships)
                .ThenInclude(cm => cm.Committee)
            .Include(u => u.PartyMemberships)
                .ThenInclude(pm => pm.Party)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == request.UserId, ct);

        if (user is null)
            throw new KeyNotFoundException($"Пользователь с ID {request.UserId} не найден");
        
        var fullName = $"{user.LastName} {user.MiddleName} {user.FirstName}";

        // Получаем роль
        var roleName = user.Role?.Name ?? "Депутат";

        // Получаем партию из первой активной membership
        var activeParty = user.PartyMemberships
            .FirstOrDefault(pm => pm.IsActive);
        var partyName = activeParty?.Party?.Name ?? "Беспартийный";

        // Дата начала членства (CreatedAt пользователя или earliest membership)
        var memberSince = user.CreatedAt;

        // Комиссии
        var commissions = user.CommitteesMemberships
            .Select(cm => new CommissionMembershipDto(
                CommitteeName: cm.Committee?.Name ?? "Неизвестная комиссия",
                AppointedAt: cm.AppointedAt,
                DismissedAt: cm.DismissedAt,
                IsChairman: cm.IsChairman,
                Status: GetMembershipStatus(cm.DismissedAt, cm.CStatus)
            ))
            .OrderByDescending(cm => cm.DismissedAt == null)
            .ThenByDescending(cm => cm.AppointedAt)
            .ToList();

        return new UserProfileDto(
            Id: user.Id,
            FullName: fullName,
            Email: user.Email,
            RoleName: roleName,
            MemberSince: memberSince,
            HomePhone: user.HomePhone ?? string.Empty,
            WorkPhone: user.WorkPhone ?? string.Empty,
            Commissions: commissions
        );
    }

    private static string GetMembershipStatus(DateTime? dismissedAt, Statuses status)
    {
        if (status == Statuses.Archived || dismissedAt.HasValue)
            return "Архив";
        return "Активен";
    }
}