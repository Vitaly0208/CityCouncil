using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Parties.Create;


public class CreatePartyHandler : IRequestHandler<CreatePartyCommand, CreatePartyDto>
{
    private readonly IPartyRepository _repo;
    private readonly IUnitOfWork _uow;

    public CreatePartyHandler(IPartyRepository repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<CreatePartyDto> Handle(CreatePartyCommand request, CancellationToken ct)
    {
        if (await _repo.ExistsByNameAsync(request.Name, ct))
            throw new InvalidOperationException($"Party '{request.Name}' already exists.");

        var party = new Party 
        { 
            Id = Guid.NewGuid(), 
            Name = request.Name, 
            Abbreviation = request.Abbreviation, 
            Ideology = request.Ideology 
        };
        await _repo.AddAsync(party, ct);
        await _uow.SaveAsync(ct);
        return new CreatePartyDto(party.Id, party.Name, party.Abbreviation, party.Ideology);
    }
}