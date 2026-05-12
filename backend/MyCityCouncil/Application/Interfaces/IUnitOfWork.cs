namespace MyCityCouncil.Application.Interfaces;

public interface IUnitOfWork
{
    Task SaveAsync(CancellationToken ct = default);
}