using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Committees.Members.AppointChairman;

public class AppointChairmanHandler : IRequestHandler<AppointChairmanCommand, MembershipDto>
{
    private readonly ICommitteeRepository _repo;
    private readonly IUnitOfWork _unitOfWork;

    public AppointChairmanHandler(ICommitteeRepository repo, IUnitOfWork unitOfWork)
    {
        _repo = repo;
        _unitOfWork = unitOfWork;
    }

    public async Task<MembershipDto> Handle(AppointChairmanCommand request, CancellationToken ct)
    {
        var isAlreadyChairman = await _repo.IsCurrentChairmanAsync(request.CommitteeId, request.UserId, ct);
        var isChairmanExist = await _repo.HasActiveChairmanAsync(request.CommitteeId, ct);
        if (isAlreadyChairman)
        {
            throw new InvalidOperationException("Этот пользователь уже является председателем данной комиссии.");
        }
        if (isChairmanExist)
        {
            throw new InvalidOperationException("У этой комиссии уже есть председатель.");
        }
        var membership = await _repo.AppointChairmanAsync(request.CommitteeId, request.UserId, ct);
        
        await _unitOfWork.SaveAsync(ct);

        return new MembershipDto(
            membership.Id,
            membership.UserId,
            membership.CommitteeId,
            membership.AppointedAt,
            membership.IsChairman
        );
    }
}