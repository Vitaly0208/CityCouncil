using MediatR;

namespace MyCityCouncil.Application.Features.Sessions.Create;

public record CreateSessionWithQueueCommand(
    Guid CommitteeId,
    string Title,
    DateTime HeldAt,
    string? Location
) : IRequest<SessionDto>;