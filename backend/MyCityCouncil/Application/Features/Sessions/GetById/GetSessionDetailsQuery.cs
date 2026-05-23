using MediatR;

namespace MyCityCouncil.Application.Features.Sessions.GetById;

public record GetSessionDetailsQuery(Guid SessionId) : IRequest<SessionDetailDto?>;