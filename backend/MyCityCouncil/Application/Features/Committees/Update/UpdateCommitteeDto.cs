namespace MyCityCouncil.Application.Features.Committees.Update;

public record UpdateCommitteeDto(
    Guid Id,
    string Name,
    string Specialization,
    string Description
);