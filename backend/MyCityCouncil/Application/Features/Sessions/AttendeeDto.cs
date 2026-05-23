namespace MyCityCouncil.Application.Features.Sessions;

public record AttendeeDto(
    Guid Id,
    string Name,
    string Role
);