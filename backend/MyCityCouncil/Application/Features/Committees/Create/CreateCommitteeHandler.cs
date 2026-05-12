using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Enums;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Committees.Create;

public class CreateCommitteeHandler : IRequestHandler<CreateCommitteeCommand, CreateCommitteeDto>
{
    private readonly ICommitteeRepository _committeeRepo;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCommitteeHandler(ICommitteeRepository committeeRepo, IUnitOfWork unitOfWork)
    {
        _committeeRepo = committeeRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<CreateCommitteeDto> Handle(CreateCommitteeCommand request, CancellationToken ct)
    {
        if (await _committeeRepo.ExistsByNameAsync(request.Name, ct))
            throw new InvalidOperationException($"Комиссия с названием '{request.Name}' уже существует.");
        
        var committee = new Domain.Models.Committee
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Specialization = request.Specialization,
            Description = request.Description,
            IsArchived = false
        };

        await _committeeRepo.AddAsync(committee, ct);
        await _unitOfWork.SaveAsync(ct);
        
        return new CreateCommitteeDto(
            committee.Id,
            committee.Name,
            committee.Specialization
        );
    }
}