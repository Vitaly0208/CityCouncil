using MediatR;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Enums;

namespace MyCityCouncil.Application.Features.UsersS.GetProfile;

public class GetUserProfileHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto>
{
    private readonly IUserRepository _userRepository;

    public GetUserProfileHandler(IUserRepository userRepository) => _userRepository = userRepository;

    public async Task<UserProfileDto> Handle(GetUserProfileQuery request, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdWithRelationsAsync(request.UserId, ct)
            ?? throw new KeyNotFoundException($"Пользователь с ID {request.UserId} не найден");
        
        var fullName = $"{user.LastName} {user.MiddleName} {user.FirstName}";
        var roleName = user.Role?.Name ?? "Депутат";
        
        var activeMembership = user.PartyMemberships?.FirstOrDefault(m => m.IsActive);
        var currentParty = activeMembership != null
            ? new PartyMembershipDto(
                PartyId: activeMembership.PartyId,
                PartyName: activeMembership.Party?.Name ?? "Неизвестная партия",
                Abbreviation: activeMembership.Party?.Abbreviation,
                Ideology: activeMembership.Party?.Ideology,
                AppointedAt: activeMembership.AppointedAt
              )
            : null;

        var commissions = user.CommitteesMemberships?
            .Select(cm => new CommissionMembershipDto(
                CommitteeName: cm.Committee?.Name ?? "Неизвестная комиссия",
                AppointedAt: cm.AppointedAt,
                DismissedAt: cm.DismissedAt,
                IsChairman: cm.IsChairman,
                Status: GetMembershipStatus(cm.DismissedAt, cm.CStatus)
            ))
            .OrderByDescending(cm => cm.DismissedAt == null)
            .ThenByDescending(cm => cm.AppointedAt)
            .ToList() ?? new List<CommissionMembershipDto>();

        return new UserProfileDto(
            Id: user.Id,
            FullName: fullName,
            Email: user.Email,
            RoleName: roleName,
            MemberSince: user.CreatedAt,
            HomePhone: user.HomePhone ?? string.Empty,
            WorkPhone: user.WorkPhone ?? string.Empty,
            Commissions: commissions,
            CurrentParty: currentParty
        );
    }

    private static string GetMembershipStatus(DateTime? dismissedAt, Statuses status) =>
        status == Statuses.Archived || dismissedAt.HasValue ? "Архив" : "Активен";
}