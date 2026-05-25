using MediatR;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.UsersS.GetUsers;

public class GetUsersHandler : IRequestHandler<GetUsersQuery, List<User>>
{
    private readonly IUserRepository _repository;

    public GetUsersHandler(IUserRepository repository) => _repository = repository;

    public async Task<List<User>> Handle(GetUsersQuery request, CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var users = await _repository.SearchAsync(request.SearchTerm, ct);
            return string.IsNullOrWhiteSpace(request.Role) 
                ? users 
                : users.Where(u => u.Role.Name == request.Role).ToList();
        }

        var allUsers = await _repository.GetAllAsync(ct);
        return string.IsNullOrWhiteSpace(request.Role) 
            ? allUsers 
            : allUsers.Where(u => u.Role.Name == request.Role).ToList();
    }
}