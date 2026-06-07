namespace MyCityCouncil.Application.Features.UsersS.GetRating;

public record UserRatingDto(
    Guid UserId,
    string FullName,
    int RatingScore
);