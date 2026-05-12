namespace MyCityCouncil.Application.Features.Committees.Create;

public record CreateCommitteeDto(
    Guid Id,
    string Name,
    string Specialization
);