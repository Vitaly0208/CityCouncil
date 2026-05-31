using MediatR;

namespace MyCityCouncil.Application.Features.Committees.Create;

public record CreateCommitteeCommand(
    string Name,
    string Specialization,
    string? Description, 
    Guid ChairmanId
) : IRequest<CreateCommitteeDto>;