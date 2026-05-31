namespace MyCityCouncil.Application.Features.UsersS.UpdateProfile;

public record UpdateProfileDto(
    Guid Id,
    string FullName,
    string? HomePhone,
    string? WorkPhone
);