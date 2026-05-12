using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Committees.Update;

public class UpdateCommitteeHandler : IRequestHandler<UpdateCommitteeCommand, UpdateCommitteeDto>
{
    private readonly ICommitteeRepository _repo;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCommitteeHandler(ICommitteeRepository repo, IUnitOfWork unitOfWork)
    {
        _repo = repo;
        _unitOfWork = unitOfWork;
    }

    public async Task<UpdateCommitteeDto> Handle(UpdateCommitteeCommand request, CancellationToken ct)
    {
        var committee = await _repo.GetByIdAsync(request.Id, ct)
                        ?? throw new KeyNotFoundException($"Комиссия с ID {request.Id} не найдена.");
        
        if (await _repo.ExistsByNameAsync(request.Name, ct))
            throw new InvalidOperationException($"Комиссия с названием '{request.Name}' уже существует.");
        
        committee.Name = request.Name;
        committee.Specialization = request.Specialization;
        committee.Description = request.Description;
        
        _repo.Update(committee, ct);
        await _unitOfWork.SaveAsync(ct);
        
        return new UpdateCommitteeDto(committee.Id, committee.Name, committee.Specialization, committee.Description);
    }
}