namespace MyCityCouncil.Application.Features.Committees.GetList;

public record CommitteesListDto(
    Guid Id,
    string Name,
    string Specialization,
    string? Description,
    int MemberCount,
    string? ChairmanName
);