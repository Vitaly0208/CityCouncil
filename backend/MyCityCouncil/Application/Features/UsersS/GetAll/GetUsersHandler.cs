using MediatR;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.UsersS.GetAll;

public class GetAllUsersHandler : IRequestHandler<GetAllUsersQuery, List<UserSearchDto>>
{
    private readonly IUserRepository _userRepository;

    public GetAllUsersHandler(IUserRepository userRepository) =>
        _userRepository = userRepository;

    public async Task<List<UserSearchDto>> Handle(GetAllUsersQuery request, CancellationToken ct)
    {
        var users = await _userRepository.GetAllFilteredAsync(
            searchTerm: request.SearchTerm,
            role: request.Role,
            committeeId: request.CommitteeId,
            page: request.Page,
            pageSize: request.PageSize,
            ct: ct
        );

        return users.Select(u => new UserSearchDto(
            Id: u.Id,
            FirstName: u.FirstName,
            LastName: u.LastName,
            MiddleName: u.MiddleName,
            Email: u.Email,
            RoleName: u.Role?.Name ?? "Пользователь",
            CurrentPartyName: _userRepository.GetCurrentPartyName(u),
            ActiveCommitteeNames: _userRepository.GetActiveCommitteeNames(u)
        )).ToList();
    }
}