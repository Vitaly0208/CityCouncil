using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken ct = default);
    Task AddAsync(RefreshToken refreshToken, CancellationToken ct = default);
    Task<IEnumerable<RefreshToken>> GetActiveByUserIdAsync(Guid userId, CancellationToken ct = default);
}