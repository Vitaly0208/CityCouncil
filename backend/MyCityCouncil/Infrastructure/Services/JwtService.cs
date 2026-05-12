using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.DTO;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;
using MyCityCouncil.Infrastructure.Options;

namespace MyCityCouncil.Infrastructure.Services;

public class JwtService : IJwtService
{
    private readonly JwtOptions _jwtOptions;
    private  readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUnitOfWork _unitOfWork;

    public JwtService(
        IOptions<JwtOptions> jwtOptions, 
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IUnitOfWork unitOfWork)
    {
        _jwtOptions = jwtOptions.Value;
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<JwtResponse> GenerateToken(User user, CancellationToken ct = default)
    {
        var role = await _roleRepository.GetRoleById(user.RoleId, ct);
        
        if (role is null)
            throw new InvalidOperationException($"Role {user.RoleId} not found");

        Claim[] claims =
        [
            new("userId", user.Id.ToString()),
            new("role", role.Name)
        ];
        
        var tokenExpires = DateTime.UtcNow.AddHours(_jwtOptions.TokenExpiresHours);
        
        var signingCredentials =
            new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SecretKey)), SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            signingCredentials: signingCredentials,
            expires: tokenExpires
        );
        
        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
        
        var res = new JwtResponse()
        {
            AccessToken = accessToken,
            ExpiresIn = (int)tokenExpires.Subtract(DateTime.UtcNow).TotalSeconds,
            RefreshToken = await GenerateRefresh(user.Id, ct)
        };
        
        return res;
    }
    
    public async Task<string> GenerateRefresh(Guid userId, CancellationToken ct = default)
    {
        RefreshToken refreshToken = new RefreshToken()
        {
            Token = Convert.ToBase64String(
                System.Security.Cryptography.RandomNumberGenerator.GetBytes(32)),
            UserId = userId,
            ExpiresAt = DateTime.UtcNow.AddHours(_jwtOptions.RefreshTokenExpiresHours)
        };
        
        await _refreshTokenRepository.AddAsync(refreshToken, ct);
        return refreshToken.Token;
    }
    
    public async Task RevokeRefreshs(Guid userId, CancellationToken ct =  default)
    {
        var tokens = await _refreshTokenRepository.GetActiveByUserIdAsync(userId, ct);

        foreach (var t in tokens)
        {
            t.RevokedAt = DateTime.UtcNow;
        }
        await _unitOfWork.SaveAsync(ct);
    }

    public async Task<JwtResponse?> ValidateRefreshJwt(string token, CancellationToken ct = default)
    {
        var refresh = await _refreshTokenRepository.GetByTokenAsync(token, ct);
        if (refresh is null || refresh.ExpiresAt < DateTime.UtcNow || refresh.RevokedAt.HasValue)
            return null;

        refresh.RevokedAt = DateTime.UtcNow;
        await _unitOfWork.SaveAsync(ct);

        var user = await _userRepository.GetByIdAsync(refresh.UserId, ct);
        if (user is null) return null;

        return await GenerateToken(user, ct);
    }
}