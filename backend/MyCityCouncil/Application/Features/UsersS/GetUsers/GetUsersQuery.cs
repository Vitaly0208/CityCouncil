using MediatR;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.UsersS.GetUsers;

public record GetUsersQuery(
    string? Role = null,
    string? SearchTerm = null
) : IRequest<List<User>>;