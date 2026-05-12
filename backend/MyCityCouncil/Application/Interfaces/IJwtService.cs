using MyCityCouncil.Domain.DTO;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Interfaces;

public interface IJwtService
{
    Task<JwtResponse> GenerateToken(User user,  CancellationToken ct = default);
    Task RevokeRefreshs(Guid userId, CancellationToken ct = default);
    Task<string> GenerateRefresh(Guid userId, CancellationToken ct = default);
    Task<JwtResponse> ValidateRefreshJwt(string token, CancellationToken ct = default);
}