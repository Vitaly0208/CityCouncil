using MediatR;

namespace MyCityCouncil.Application.Features.Committees.GetList;



public record GetCommitteesListQuery : IRequest<List<CommitteesListDto>>;