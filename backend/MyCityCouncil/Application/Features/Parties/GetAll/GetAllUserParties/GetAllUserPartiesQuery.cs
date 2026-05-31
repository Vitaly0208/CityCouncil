using MediatR;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Parties.GetAll.GetAllUserParties;

public record GetAllUserPartiesQuery(Guid UserId) : IRequest<List<PartyDto>>;