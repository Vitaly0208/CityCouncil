using MediatR;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Parties.GetById;

public class GetPartyByIdHandler : IRequestHandler<GetPartyByIdQuery, PartyDto>
{
    private readonly IPartyRepository _repo;

    public GetPartyByIdHandler(IPartyRepository repo) => _repo = repo;

    public async Task<PartyDto> Handle(GetPartyByIdQuery request, CancellationToken ct)
    {
        var party = await _repo.GetByIdAsync(request.Id, ct)
                    ?? throw new KeyNotFoundException($"Party with ID {request.Id} not found.");

        return new PartyDto(
            party.Id,
            party.Name,
            party.Abbreviation,
            party.Ideology,
            party.Memberships
                .Select(m => new PartyMemberDto(
                    m.UserId,
                    $"{m.User.FirstName} {m.User.LastName}",
                    m.AppointedAt,
                    m.DismissedAt,
                    m.IsActive
                )).ToList()
        );
    }
}