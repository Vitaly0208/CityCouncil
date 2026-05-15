using MediatR;

namespace MyCityCouncil.Application.Features.Initiatives.Promote;

public record PromoteTopInitiativesCommand(
    int Count = 3
) : IRequest<List<Guid>>;