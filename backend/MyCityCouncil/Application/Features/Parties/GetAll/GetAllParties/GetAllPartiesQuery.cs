using MediatR;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Parties.GetAll.GetAllParties;

public record GetAllPartiesQuery : IRequest<List<PartyDto>>;