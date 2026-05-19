using MediatR;

namespace MyCityCouncil.Application.Features.Sessions.GetAll;

public record GetAllSessionsQuery(
    Guid? CommitteeId = null,
    bool? IsCompleted = null,
    int Page = 1,
    int PageSize = 20
) : IRequest<List<SessionListDto>>;