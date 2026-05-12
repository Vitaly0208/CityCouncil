using MediatR;

namespace MyCityCouncil.Application.Features.Auth.Logout;

public record LogoutCommand : IRequest<Unit>
{
    public Guid UserId { get; set; }
}