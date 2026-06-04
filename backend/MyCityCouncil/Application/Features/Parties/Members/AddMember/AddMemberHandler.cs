using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Parties.Members.AddMember;

public class JoinPartyHandler : IRequestHandler<AddMemberCommand, MembershipJoinDto>
{
    private readonly IPartyRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly IUserRepository _userRepository;

    public JoinPartyHandler(
        IPartyRepository repo,
        IUnitOfWork uow,
        IUserRepository userRepository)
    {
        _repo = repo;
        _uow = uow;
        _userRepository = userRepository;
    }

    public async Task<MembershipJoinDto> Handle(AddMemberCommand request, CancellationToken ct)
    {
        var hasActiveParty = await _userRepository.HasActivePartyAsync(request.UserId, ct);
        if (hasActiveParty)
            throw new InvalidOperationException("Вы уже состоите в другой партии. Сначала покиньте текущую.");
        
        var membership = await _repo.AddMemberAsync(request.PartyId, request.UserId, ct);
        await _uow.SaveAsync(ct);
        return new MembershipJoinDto(membership.Id, membership.PartyId, membership.UserId, membership.AppointedAt, membership.PStatus);
    }
}