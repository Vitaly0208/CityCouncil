using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Committees.Delete;

public class DeleteCommitteeHandler : IRequestHandler<DeleteCommitteeCommand, Unit>
{
    private readonly ICommitteeRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCommitteeHandler(ICommitteeRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(DeleteCommitteeCommand request, CancellationToken ct)
    {
        var committee = await _repository.GetByIdAsync(request.CommitteeId, ct);

        if (committee is null)
        {
            throw new KeyNotFoundException($"Комиссия с ID {request.CommitteeId} не найдена.");
        }
        
        var archived = await _repository.ArchiveAsync(request.CommitteeId, ct);
        
        if (!archived)
        {
            throw new InvalidOperationException("Не удалось заархивировать комиссию");
        }

        await _unitOfWork.SaveAsync(ct);

        return Unit.Value;
    }
}