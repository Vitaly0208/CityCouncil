using MediatR;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.UsersS.GetRating;

public class GetTopDeputiesHandler : IRequestHandler<GetTopDeputiesQuery, List<UserRatingDto>>
{
    private readonly IUserRepository _userRepository;

    public GetTopDeputiesHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<UserRatingDto>> Handle(GetTopDeputiesQuery request, CancellationToken ct)
    {
        return await _userRepository.GetTopRatedDeputiesAsync(request.Limit, ct);
    }
}