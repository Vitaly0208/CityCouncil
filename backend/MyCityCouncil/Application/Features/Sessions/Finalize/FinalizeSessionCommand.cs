using MediatR;

namespace MyCityCouncil.Application.Features.Sessions.Finalize;

public record FinalizeSessionCommand(Guid SessionId) : IRequest<Unit>;