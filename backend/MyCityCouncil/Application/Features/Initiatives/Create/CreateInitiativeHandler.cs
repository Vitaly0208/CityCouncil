using MediatR;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Initiatives.Create;

public class CreateInitiativeHandler : IRequestHandler<CreateInitiativeCommand, CreateInitiativeResponseDto>
{
    private readonly IInitiativeRepository _initiativeRepository;
    private readonly ICommitteeRepository _committeeRepository;
    private readonly ILogger<CreateInitiativeHandler> _logger;

    public CreateInitiativeHandler(
        IInitiativeRepository initiativeRepository, 
        ICommitteeRepository committeeRepository,
        ILogger<CreateInitiativeHandler> logger)
    {
        _initiativeRepository = initiativeRepository;
        _committeeRepository = committeeRepository;
        _logger = logger;
    }

    public async Task<CreateInitiativeResponseDto> Handle(CreateInitiativeCommand request, CancellationToken ct)
    {
        string committeeName = "Не указана";
        Guid? finalCommitteeId = null;
        
        if (request.CommitteeId.HasValue && request.CommitteeId.Value != Guid.Empty)
        {
            var committee = await _committeeRepository.GetByIdAsync(request.CommitteeId.Value, ct)
                ?? throw new KeyNotFoundException("Указанная комиссия не найдена");

            var isMember = await _committeeRepository.IsUserActiveMemberAsync(
                committeeId: request.CommitteeId.Value,
                userId: request.UserId,    
                ct);
            
            if (!isMember)
                throw new InvalidOperationException("Вы не состоите в выбранной комиссии");

            finalCommitteeId = request.CommitteeId.Value;
            committeeName = committee.Name;
        }

        var initiative = new Initiative
        {
            Title = request.Title,
            Description = request.Description,
            UserId = request.UserId,
            CommitteeId = finalCommitteeId,
            Status = InitiativeStatus.PendingReview,
            CreatedAt = DateTime.UtcNow
        };

        await _initiativeRepository.AddAsync(initiative, ct);
        await _initiativeRepository.SaveChangesAsync(ct);
        
        _logger.LogInformation("СОЗДАНИЕ ИНИЦИАТИВЫ: UserId={UserId}, InitiativeId={Id}, Title='{Title}'", 
            request.UserId, initiative.Id, initiative.Title);

        return new CreateInitiativeResponseDto(
            Id: initiative.Id,
            Title: initiative.Title,
            Description: initiative.Description,
            Status: initiative.Status,
            CommitteeId: finalCommitteeId,
            CommitteeName: committeeName,
            CreatedAt: initiative.CreatedAt
        );
    }
}
