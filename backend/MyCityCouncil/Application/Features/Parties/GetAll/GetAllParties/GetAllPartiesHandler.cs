using MediatR;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Parties.GetAll.GetAllParties;

public class GetAllPartiesHandler : IRequestHandler<GetAllPartiesQuery, List<PartyDto>>
{
    private readonly IPartyRepository _repo;
    
    public GetAllPartiesHandler(IPartyRepository repo) => _repo = repo;

    public async Task<List<PartyDto>> Handle(GetAllPartiesQuery request, CancellationToken ct)
    {
        var parties = await _repo.GetAllAsync(ct);
        return parties.Select(p => new PartyDto(
            p.Id,
            p.Name,
            p.Abbreviation,
            p.Ideology,
            p.Memberships.Select(m => new PartyMemberDto(
                m.UserId,
                $"{m.User.FirstName} {m.User.LastName}",
                m.AppointedAt,
                m.DismissedAt,
                m.IsActive
            )).ToList()
        )).ToList();
    }
}