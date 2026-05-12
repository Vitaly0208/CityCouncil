using MediatR;

namespace MyCityCouncil.Application.Features.Committees.Update;

public record UpdateCommitteeCommand(
    Guid Id,
    string Name,
    string Specialization,
    string Description
) : IRequest<UpdateCommitteeDto>;