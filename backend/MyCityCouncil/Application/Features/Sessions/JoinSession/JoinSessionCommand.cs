using MediatR;

namespace MyCityCouncil.Application.Features.Sessions.JoinSession;

public record JoinSessionCommand(
    Guid SessionId,
    Guid UserId
) : IRequest<Unit>;