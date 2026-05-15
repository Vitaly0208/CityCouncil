using MediatR;

namespace MyCityCouncil.Application.Features.UsersS.GetProfile;

public record GetUserProfileQuery(Guid UserId) : IRequest<UserProfileDto>;