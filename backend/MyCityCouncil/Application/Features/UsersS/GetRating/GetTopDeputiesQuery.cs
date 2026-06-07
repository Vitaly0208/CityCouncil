using MediatR;

namespace MyCityCouncil.Application.Features.UsersS.GetRating;

public record GetTopDeputiesQuery(int Limit = 10) : IRequest<List<UserRatingDto>>;