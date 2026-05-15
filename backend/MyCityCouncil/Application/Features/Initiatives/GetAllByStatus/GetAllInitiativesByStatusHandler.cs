using MediatR;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Initiatives.GetAllByStatus;

public class GetInitiativesHandler : IRequestHandler<GetAllInitiativesByStatusQuery, List<InitiativeDto>>
{
    private readonly IInitiativeRepository _initiativeRepository;

    public GetInitiativesHandler(IInitiativeRepository initiativeRepository) =>
        _initiativeRepository = initiativeRepository;

    public async Task<List<InitiativeDto>> Handle(GetAllInitiativesByStatusQuery request, CancellationToken ct)
    {
        List<Initiative> initiatives;

        if (!string.IsNullOrEmpty(request.Status) && 
            Enum.TryParse<InitiativeStatus>(request.Status, out var status))
        {
            initiatives = await _initiativeRepository.GetByStatusAsync(status, ct);
        }
        else
        {
            initiatives = await _initiativeRepository.GetAllAsync(ct);
        }

        return initiatives.Select(i => new InitiativeDto(
            Id: i.Id,
            Title: i.Title,
            Description: i.Description,
            Status: i.Status,
            UserId: i.UserId,
            AuthorName: FormatAuthorName(i.User),
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