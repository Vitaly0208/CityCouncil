namespace MyCityCouncil.Application.Features.Auth.Register;
using MediatR;

public record RegisterCommand : IRequest<RegisterDto>
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string FirstName { get; set; }
    public string MiddleName { get; set; }
    public string LastName { get; set; }
}