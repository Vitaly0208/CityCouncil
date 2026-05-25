using MediatR;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Committees.GetDetails;

public class GetCommitteeDetailsHandler : IRequestHandler<GetCommitteeDetailsQuery, CommitteeDetailsDto>
{
    private readonly ICommitteeRepository _repo;

    public GetCommitteeDetailsHandler(ICommitteeRepository repo) => _repo = repo;

    public async Task<CommitteeDetailsDto> Handle(GetCommitteeDetailsQuery request, CancellationToken ct)
    {
        var committee = await _repo.GetByIdAsync(request.CommitteeId, ct)
            ?? throw new KeyNotFoundException($"Комиссия с ID {request.CommitteeId} не найдена.");
        
        var currentMembers = await _repo.GetActiveMembersAsync(request.CommitteeId, ct);
        
        var history = await _repo.GetHistoryAsync(request.CommitteeId, yearsBack: 10, ct);
        
        var initiatives = await _repo.GetAcceptedInitiativesByMembersAsync(request.CommitteeId, ct);
        
        var sessions = await _repo.GetUpcomingSessionsAsync(request.CommitteeId, ct);
        
        var currentMembersDto = currentMembers
            .Select(m => new CommitteeMemberDto(
                m.UserId,
                $"{m.User.FirstName} {m.User.MiddleName} {m.User.LastName}",
                m.IsChairman,
                m.AppointedAt))
            .OrderByDescending(m => m.IsChairman)
            .ThenBy(m => m.FullName)
            .ToList();
        
        var historyDto = history
            .Select(h => new CommitteeHistoryEntryDto(
                h.UserId,
                $"{h.User.FirstName} {h.User.LastName}",
                h.IsChairman,
                h.AppointedAt,
                h.DismissedAt))
            .OrderByDescending(h => h.AppointedAt)
            .ToList();
        
        var initiativesDto = initiatives
            .Select(i => new InitiativeSummaryDto(
                i.Id,
                i.Title,
                $"{i.User?.FirstName} {i.User?.LastName}",
                i.CreatedAt
            ))
            .ToList();
        
        var sessionsDto = sessions
            .Select(s => new SessionSummaryDto(
                s.Id,
                s.Title,
                s.HeldAt,
                s.Location
            ))
            .ToList();

        return new CommitteeDetailsDto(
            committee.Id,
            committee.Name,
            committee.Specialization,
            committee.Description,
            committee.IsArchived,
            currentMembersDto,
            historyDto,
            initiativesDto,
            sessionsDto
        );
    }
}