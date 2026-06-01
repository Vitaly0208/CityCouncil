using MediatR;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Initiatives.GetApproved;

public class GetApprovedInitiativesHandler : IRequestHandler<GetApprovedInitiativesQuery, List<InitiativeDto>>
{
    private readonly IInitiativeRepository _initiativeRepository;

    public GetApprovedInitiativesHandler(IInitiativeRepository initiativeRepository) =>
        _initiativeRepository = initiativeRepository;

    public async Task<List<InitiativeDto>> Handle(GetApprovedInitiativesQuery request, CancellationToken ct)
    {
        var initiatives = await _initiativeRepository.GetByStatusAsync(InitiativeStatus.Accepted , ct);

        return initiatives.Select(i => new InitiativeDto(
            Id: i.Id,
            Title: i.Title,
            Description: i.Description,
            Status: i.Status,
            UserId: i.UserId,
            AuthorName: FormatAuthorName(i.User),
            CommitteeId: i.CommitteeId,
            CommitteeName: i.Committee.Name,
            CreatedAt: i.CreatedAt,
            ApprovedAt: i.ApprovedAt,
            FinalizedAt: i.FinalizedAt
        )).ToList();
    }

    private static string FormatAuthorName(User? user) =>
        user != null 
            ? $"{user.LastName} {user.MiddleName} {user.FirstName}".Trim() 
            : "Неизвестный автор";
}