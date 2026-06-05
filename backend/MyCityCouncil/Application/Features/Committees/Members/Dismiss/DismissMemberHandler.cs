using MediatR;
using MyCityCouncil.Application.Features.Committees.Members;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Committees.Members.Dismiss;

public class DismissMemberHandler : IRequestHandler<DismissMemberCommand, MembershipDto>
{
    private readonly ICommitteeRepository _repo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DismissMemberHandler> _logger;

    public DismissMemberHandler(
        ICommitteeRepository repo, 
        IUnitOfWork unitOfWork,
        ILogger<DismissMemberHandler> logger)
    {
        _repo = repo;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<MembershipDto> Handle(DismissMemberCommand request, CancellationToken ct)
    {
        var membership = await _repo.DismissMemberAsync(request.CommitteeId, request.UserId, ct);
        
        if (membership is null)
            throw new InvalidOperationException($"Пользователь {request.UserId} не является активным участником комиссии {request.CommitteeId}.");
        
        _logger.LogInformation("ВЫХОД ИЗ КОМИССИИ: UserId={UserId} покинул комиссию CommitteeId={CommitteeId}", 
            request.UserId, request.CommitteeId);
        
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