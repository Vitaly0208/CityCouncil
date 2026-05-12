using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Committees.Members.AddMember;

public class AddMemberHandler : IRequestHandler<AddMemberCommand, MembershipDto>
{
    private readonly ICommitteeRepository _repo;
    private readonly IUnitOfWork _unitOfWork;

    public AddMemberHandler(ICommitteeRepository repo, IUnitOfWork unitOfWork)
    {
        _repo = repo;
        _unitOfWork = unitOfWork;
    }

    public async Task<MembershipDto> Handle(AddMemberCommand request, CancellationToken ct)
    {
        var membership = await _repo.AddMemberAsync(
            request.CommitteeId, 
            request.UserId, 
            isChairman: false, 
            ct);
        membership.CStatus = Statuses.Active;
        
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