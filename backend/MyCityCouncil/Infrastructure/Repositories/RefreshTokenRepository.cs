using Microsoft.EntityFrameworkCore;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Models;
using MyCityCouncil.Infrastructure.Persistence;

namespace MyCityCouncil.Infrastructure.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly AppDbContext _db;

    public RefreshTokenRepository(AppDbContext db) => _db = db;
    
    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken ct = default) =>
        await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == token, ct);

    public async Task AddAsync(RefreshToken refreshToken, CancellationToken ct = default)
    {
        await _db.RefreshTokens.AddAsync(refreshToken, ct);
    }

    public async Task<IEnumerable<RefreshToken>> GetActiveByUserIdAsync(Guid userId, CancellationToken ct = default) =>
        await _db.RefreshTokens
            .AsNoTracking()    
            .Where(r => r.UserId == userId && r.RevokedAt == null && r.ExpiresAt > DateTime.UtcNow)
            .ToListAsync(ct);
}