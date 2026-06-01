using MediatR;


namespace MyCityCouncil.Application.Features.UsersS.GetAll;

public record GetAllUsersQuery(
    string? SearchTerm,
    string? Role,
    Guid? CommitteeId,
    int Page = 1,
    int PageSize = 20
) : IRequest<List<UserSearchDto>>;


public record UserSearchDto(
    Guid Id,
    string FirstName,
    string LastName,
    string? MiddleName,
    string Email,
    string RoleName,
    string? CurrentPartyName,
    List<string> ActiveCommitteeNames
);