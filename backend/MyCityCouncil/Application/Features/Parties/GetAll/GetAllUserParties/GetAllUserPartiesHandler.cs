using MediatR;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Parties.GetAll.GetAllUserParties;

public class GetAllUserPartiesHandler : IRequestHandler<GetAllUserPartiesQuery, List<PartyDto>>
{
    private readonly IPartyRepository _repo;
    
    public GetAllUserPartiesHandler(IPartyRepository repo) => _repo = repo;

    public async Task<List<PartyDto>> Handle(GetAllUserPartiesQuery request, CancellationToken ct)
    {
        var parties = await _repo.GetUserPartiesAsync(request.UserId, ct);
        return parties.Select(p => new PartyDto(
            p.Id,
            p.Name,
            p.Abbreviation,
            p.Ideology,
            p.Memberships.Where(m => m.UserId == request.UserId && m.IsActive)
                .Select(m => new PartyMemberDto(
                    m.UserId,
                    $"{m.User.FirstName} {m.User.LastName}",
                    m.AppointedAt,
                    m.DismissedAt,
                    m.IsActive
                )).ToList()
        )).ToList();
    }
}