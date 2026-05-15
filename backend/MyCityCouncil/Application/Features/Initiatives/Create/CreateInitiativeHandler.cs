using MediatR;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Initiatives.Create;

public class CreateInitiativeHandler : IRequestHandler<CreateInitiativeCommand, CreateInitiativeResponseDto>
{
    private readonly IInitiativeRepository _initiativeRepository;

    public CreateInitiativeHandler(IInitiativeRepository initiativeRepository) =>
        _initiativeRepository = initiativeRepository;

    public async Task<CreateInitiativeResponseDto> Handle(CreateInitiativeCommand request, CancellationToken ct)
    {
        var initiative = new Initiative
        {
            Title = request.Title,
            Description = request.Description,
            UserId = request.UserId,
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
            CreatedAt: initiative.CreatedAt
        );
    }
}