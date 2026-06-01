using MediatR;

namespace MyCityCouncil.Application.Features.Sessions.LeaveSession;

public record LeaveSessionCommand(Guid SessionId, Guid UserId) : IRequest<Unit>;