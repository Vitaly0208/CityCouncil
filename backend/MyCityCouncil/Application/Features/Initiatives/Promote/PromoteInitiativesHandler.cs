using MediatR;
using Microsoft.Extensions.Logging;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Initiatives.Promote;

public class PromoteTopInitiativesHandler : IRequestHandler<PromoteTopInitiativesCommand, List<Guid>>
{
    private readonly IInitiativeRepository _initiativeRepository;

    public PromoteTopInitiativesHandler(
        IInitiativeRepository initiativeRepository)
    {
        _initiativeRepository = initiativeRepository;
    }

    public async Task<List<Guid>> Handle(PromoteTopInitiativesCommand request, CancellationToken ct)
    {

        var topInitiatives = await _initiativeRepository.GetTopQueueInitiativesAsync(request.Count, ct);
        
        if (!topInitiatives.Any())
        {
            return new List<Guid>();
        }
        
        var promotedIds = new List<Guid>();
        
        foreach (var initiative in topInitiatives)
        {
            if (initiative.Status != InitiativeStatus.InQueue)
            {
                continue;
            }

            initiative.Status = InitiativeStatus.InFirstHearing;
            initiative.FinalizedAt = null;
            _initiativeRepository.Update(initiative);
            
            promotedIds.Add(initiative.Id);
            
        }
        
        if (promotedIds.Any())
        {
            await _initiativeRepository.SaveChangesAsync(ct);
        }
        
        return promotedIds;
    }
}