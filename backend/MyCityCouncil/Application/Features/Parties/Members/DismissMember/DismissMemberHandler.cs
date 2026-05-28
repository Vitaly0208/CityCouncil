using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Parties.Members.DismissMember;

public class DismissMemberHandler : IRequestHandler<DismissMemberCommand, MembershipLeftDto>
{
    private readonly IPartyRepository _repo;
    private readonly IUnitOfWork _uow;
    public DismissMemberHandler(IPartyRepository repo, IUnitOfWork uow) { _repo = repo; _uow = uow; }

    public async Task<MembershipLeftDto> Handle(DismissMemberCommand request, CancellationToken ct)
    {
        var removed = await _repo.RemoveMemberAsync(request.PartyId, request.UserId, ct);
        if (!removed) throw new KeyNotFoundException("Active membership not found");
        await _uow.SaveAsync(ct);
        return new MembershipLeftDto(Guid.NewGuid(), request.PartyId, request.UserId, DateTime.UtcNow, "Archived");
    }
}