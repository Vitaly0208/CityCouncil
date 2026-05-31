using MediatR;
using MyCityCouncil.Application.Features.Parties.Delete;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Parties.Delete;

public class DeletePartyHandler : IRequestHandler<DeletePartyCommand, Unit>
{
    private readonly IPartyRepository _repo;
    private readonly IUnitOfWork _uow;

    public DeletePartyHandler(IPartyRepository repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<Unit> Handle(DeletePartyCommand request, CancellationToken ct)
    {
        await _repo.DeleteAsync(request.Id, ct);
        await _uow.SaveAsync(ct);
        return Unit.Value;
    }
}