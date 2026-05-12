using MediatR;

namespace MyCityCouncil.Application.Features.Committees.GetDetails;


public record GetCommitteeDetailsQuery(Guid CommitteeId) : IRequest<CommitteeDetailsDto>;