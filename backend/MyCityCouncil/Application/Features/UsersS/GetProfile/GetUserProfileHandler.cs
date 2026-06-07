using MediatR;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Enums;

namespace MyCityCouncil.Application.Features.UsersS.GetProfile;

public class GetUserProfileHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IInitiativeRepository _initiativeRepository;
    private readonly ISessionRepository _sessionRepository;

    public GetUserProfileHandler(
        IUserRepository userRepository,
        IInitiativeRepository initiativeRepository,
        ISessionRepository sessionRepository)
    {
        _userRepository = userRepository;
        _initiativeRepository = initiativeRepository;
        _sessionRepository = sessionRepository;
    }

    public async Task<UserProfileDto> Handle(GetUserProfileQuery request, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdWithRelationsAsync(request.UserId, ct)
            ?? throw new KeyNotFoundException($"Пользователь с ID {request.UserId} не найден");
        
        var fullName = $"{user.LastName} {user.FirstName} {user.MiddleName} ".Trim();
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
                CommitteeId: cm.CommitteeId, 
                CommitteeName: cm.Committee?.Name ?? "Неизвестная комиссия",
                AppointedAt: cm.AppointedAt,
                DismissedAt: cm.DismissedAt,
                IsChairman: cm.IsChairman,
                Status: GetMembershipStatus(cm.DismissedAt, cm.CStatus)
            ))
            .OrderByDescending(cm => cm.DismissedAt == null)
            .ThenByDescending(cm => cm.AppointedAt)
            .ToList() ?? new List<CommissionMembershipDto>();
        
        var acceptedInitiativesEntities = await _initiativeRepository
            .GetAcceptedByUserIdAsync(user.Id, ct);
        var acceptedInitiatives = acceptedInitiativesEntities
            .Select(i => new AcceptedInitiativeDto(
                Id: i.Id,
                Title: i.Title,
                Description: i.Description,
                ApprovedAt: i.ApprovedAt ?? i.CreatedAt,
                CommitteeId:  i.CommitteeId,
                CommitteeName: i.Committee.Name 
            ))
            .ToList();
        
        var sessionsEntities = await _sessionRepository
            .GetSessionsAfterCommitteeJoinAsync(user.Id, ct);

        var sessionAttendance = sessionsEntities.Select(s => new SessionAttendanceDto(
            SessionId: s.Id,
            SessionTitle: s.Title,
            CommitteeName: s.Committee?.Name ?? string.Empty,
            HeldAt: s.HeldAt,
            WasAttended: s.Attendees.Any(a => a.UserId == user.Id),
            HearingRound: s.HearingRound
        )).ToList();

        return new UserProfileDto(
            Id: user.Id,
            FullName: fullName,
            Email: user.Email,
            RoleName: roleName,
            MemberSince: user.CreatedAt,
            HomePhone: user.HomePhone ?? string.Empty,
            WorkPhone: user.WorkPhone ?? string.Empty,
            RatingScore : user.RatingScore,
            Commissions: commissions,
            CurrentParty: currentParty,
            AcceptedInitiatives: acceptedInitiatives,
            Attendances: sessionAttendance
        );
    }

    private static string GetMembershipStatus(DateTime? dismissedAt, Statuses status) =>
        status == Statuses.Archived || dismissedAt.HasValue ? "Архив" : "Активен";
}