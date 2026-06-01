using MediatR;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Initiatives.Create;

public class CreateInitiativeHandler : IRequestHandler<CreateInitiativeCommand, CreateInitiativeResponseDto>
{
    private readonly IInitiativeRepository _initiativeRepository;
    private readonly ICommitteeRepository _committeeRepository;

    public CreateInitiativeHandler(
        IInitiativeRepository initiativeRepository, 
        ICommitteeRepository committeeRepository
        )
    {
        _initiativeRepository = initiativeRepository;
        _committeeRepository = committeeRepository;
    }

    public async Task<CreateInitiativeResponseDto> Handle(CreateInitiativeCommand request, CancellationToken ct)
    {
        var committee = await _committeeRepository.GetByIdAsync(request.CommitteeId, ct)
                        ?? throw new KeyNotFoundException("Указанная комиссия не найдена");
        var isMember = await _committeeRepository.IsUserActiveMemberAsync(request.UserId, request.CommitteeId, ct);
        if (!isMember) throw new InvalidOperationException("Вы не состоите в выбранной комиссии");
        
        var initiative = new Initiative
        {
            Title = request.Title,
            Description = request.Description,
            UserId = request.UserId,
            CommitteeId = request.CommitteeId,
            Status = InitiativeStatus.PendingReview,
            CreatedAt = DateTime.UtcNow
        };

        await _initiativeRepository.AddAsync(initiative, ct);
        await _initiativeRepository.SaveChangesAsync(ct);

        return new CreateInitiativeResponseDto(
            Id: initiative.Id,
            Title: initiative.Title,
            Description: initiative.Description,
            Status: initiative.Status,
            CommitteeId: initiative.CommitteeId,
            CommitteeName:initiative.Committee.Name,
            CreatedAt: initiative.CreatedAt
        );
    }
}