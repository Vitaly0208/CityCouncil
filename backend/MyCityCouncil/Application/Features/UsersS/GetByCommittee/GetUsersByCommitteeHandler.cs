using MediatR;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.UsersS.GetByCommittee;

public class GetUsersByCommitteeHandler : IRequestHandler<GetUsersByCommitteeQuery, List<User>>
{
    private readonly IUserRepository _repository;

    public GetUsersByCommitteeHandler(IUserRepository repository) => _repository = repository;

    public async Task<List<User>> Handle(GetUsersByCommitteeQuery request, CancellationToken ct) =>
        await _repository.GetByCommitteeIdAsync(request.CommitteeId, ct);
}