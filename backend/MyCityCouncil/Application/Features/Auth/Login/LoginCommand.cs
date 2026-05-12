using MediatR;
namespace MyCityCouncil.Application.Features.Auth.Login;

public record LoginCommand : IRequest<LoginDto>
{
    public string Email { get; set; }
    public string Password { get; set; }
}