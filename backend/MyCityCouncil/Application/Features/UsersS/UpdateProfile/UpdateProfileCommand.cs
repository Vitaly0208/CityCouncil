using MediatR;

namespace MyCityCouncil.Application.Features.UsersS.UpdateProfile;

public record UpdateProfileCommand(
    Guid UserId,
    string? HomePhone,
    string? WorkPhone
) : IRequest<UpdateProfileDto>;