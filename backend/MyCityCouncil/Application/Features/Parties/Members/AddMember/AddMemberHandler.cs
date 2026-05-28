using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Parties.Members.AddMember;

public class JoinPartyHandler : IRequestHandler<AddMemberCommand, MembershipJoinDto>
{
    private readonly IPartyRepository _repo;
    private readonly IUnitOfWork _uow;

    public JoinPartyHandler(IPartyRepository repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<MembershipJoinDto> Handle(AddMemberCommand request, CancellationToken ct)
    {
        var membership = await _repo.AddMemberAsync(request.PartyId, request.UserId, ct);
        await _uow.SaveAsync(ct);
        return new MembershipJoinDto(membership.Id, membership.PartyId, membership.UserId, membership.AppointedAt, membership.PStatus);
    }
}