using MediatR;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Committees.GetList;

public class GetAllCommitteesHandler : IRequestHandler<GetCommitteesListQuery, List<CommitteesListDto>>
{
    private readonly ICommitteeRepository _committeeRepository;

    public GetAllCommitteesHandler(ICommitteeRepository committeeRepository)
    {
        _committeeRepository = committeeRepository;
    }

    public async Task<List<CommitteesListDto>> Handle(GetCommitteesListQuery request, CancellationToken ct)
    {
        var committees = await _committeeRepository.GetAllAsync(ct);

        return committees.Select(MapToDto).ToList();
    }

    private static CommitteesListDto MapToDto(Committee committee)
    {
        // Подсчёт активных членов (у которых нет даты увольнения)
        var memberCount = committee.Memberships?.Count(m => m.DismissedAt == null) ?? 0;

        // Поиск текущего председателя
        var chairmanMembership = committee.Memberships?
            .FirstOrDefault(m => m.IsChairman && m.DismissedAt == null);

        var chairmanName = chairmanMembership?.User != null
            ? $"{chairmanMembership.User.LastName} {chairmanMembership.User.FirstName}".Trim()
            : null;

        return new CommitteesListDto(
            Id: committee.Id,
            Name: committee.Name,
            Specialization: committee.Specialization,
            Description: committee.Description,
            MemberCount: memberCount,
            ChairmanName: chairmanName
        );
    }
}