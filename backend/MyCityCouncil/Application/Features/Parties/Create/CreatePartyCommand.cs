using MediatR;

namespace MyCityCouncil.Application.Features.Parties.Create;

public record CreatePartyCommand(string Name, string Abbreviation, string Ideology) : IRequest<CreatePartyDto>;