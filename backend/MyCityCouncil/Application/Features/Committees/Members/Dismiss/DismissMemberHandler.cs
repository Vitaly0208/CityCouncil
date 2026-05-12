using MediatR;
using MyCityCouncil.Application.Features.Committees.Members;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Committees.Members.Dismiss;

public class DismissMemberHandler : IRequestHandler<DismissMemberCommand, MembershipDto>
{
    private readonly ICommitteeRepository _repo;
    private readonly IUnitOfWork _unitOfWork;

    public DismissMemberHandler(ICommitteeRepository repo, IUnitOfWork unitOfWork)
    {
        _repo = repo;
        _unitOfWork = unitOfWork;
    }

    public async Task<MembershipDto> Handle(DismissMemberCommand request, CancellationToken ct)
    {
        var membership = await _repo.DismissMemberAsync(request.CommitteeId, request.UserId, ct);
        
        if (membership is null)
            throw new InvalidOperationException($"User {request.UserId} is not an active member of committee {request.CommitteeId}.");

        // Фиксируем изменения в БД
        await _unitOfWork.SaveAsync(ct);

        return new MembershipDto(
            membership.Id,
            membership.UserId,
            membership.CommitteeId,
            membership.AppointedAt,
            membership.IsChairman // После увольнения всегда false
        );
    }
}