using MediatR;

namespace MyCityCouncil.Application.Features.Sessions.Protocol;

public record GetSessionProtocolQuery(Guid SessionId) : IRequest<SessionProtocolDto?>;