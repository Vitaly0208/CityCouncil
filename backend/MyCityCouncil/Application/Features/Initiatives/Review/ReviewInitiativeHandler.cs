using MediatR;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Initiatives.Review;

public class ReviewInitiativeHandler : IRequestHandler<ReviewInitiativeCommand, InitiativeDto>
{
    private readonly IInitiativeRepository _initiativeRepository;
    

    public ReviewInitiativeHandler(IInitiativeRepository initiativeRepository)
    {
        _initiativeRepository = initiativeRepository;
    }

    public async Task<InitiativeDto> Handle(ReviewInitiativeCommand request, CancellationToken ct)
    {
        var initiative = await _initiativeRepository.GetByIdAsync(request.InitiativeId, ct)
            ?? throw new KeyNotFoundException($"Инициатива {request.InitiativeId} не найдена");
        
        if (initiative.Status != InitiativeStatus.PendingReview)
            throw new InvalidOperationException($"Нельзя изменить статус инициативы со статусом {initiative.Status}");

        if (request.IsApproved)
        {
            initiative.Status = InitiativeStatus.InQueue;
            initiative.ApprovedAt = DateTime.UtcNow;
        }
        else
        {
            initiative.Status = InitiativeStatus.Rejected;
            initiative.FinalizedAt = DateTime.UtcNow;
        }

        _initiativeRepository.Update(initiative);
        await _initiativeRepository.SaveChangesAsync(ct);
        
        
        
        return new InitiativeDto(
            Id: initiative.Id,
            Title: initiative.Title,
            Description: initiative.Description,
            Status: initiative.Status,
            UserId: initiative.UserId,
            AuthorName: initiative.User?.LastName + " " + initiative.User?.FirstName ?? "Неизвестный",
            CommitteeId: initiative.CommitteeId,
            CommitteeName: initiative.Committee?.Name ?? "не указана",
            CreatedAt: initiative.CreatedAt,
            ApprovedAt: initiative.ApprovedAt,
            FinalizedAt: initiative.FinalizedAt
        );
    }
}