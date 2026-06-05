using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Parties.Members.DismissMember;

public class DismissPartyMemberHandler : IRequestHandler<DismissMemberCommand, MembershipLeftDto>
{
    private readonly IPartyRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<DismissPartyMemberHandler> _logger;

    public DismissPartyMemberHandler(
        IPartyRepository repo,
        IUnitOfWork uow,
        ILogger<DismissPartyMemberHandler> logger)
    {
        _repo = repo; 
        _uow = uow;
        _logger = logger;
    }

    public async Task<MembershipLeftDto> Handle(DismissMemberCommand request, CancellationToken ct)
    {
        var removed = await _repo.RemoveMemberAsync(request.PartyId, request.UserId, ct);
        if (!removed) throw new KeyNotFoundException("Active membership not found");
        await _uow.SaveAsync(ct);
        _logger.LogInformation("ВЫХОД ИЗ ПАРТИИ: UserId={UserId} покинул партию PartyId={PartyId}", 
            request.UserId, request.PartyId);
        
        return new MembershipLeftDto(Guid.NewGuid(), request.PartyId, request.UserId, DateTime.UtcNow, "Archived");
    }
}