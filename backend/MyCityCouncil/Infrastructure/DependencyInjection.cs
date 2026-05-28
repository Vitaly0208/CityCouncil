using Microsoft.EntityFrameworkCore;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Infrastructure.Options;
using MyCityCouncil.Infrastructure.Persistence;
using MyCityCouncil.Infrastructure.Repositories;
using MyCityCouncil.Infrastructure.Services;

namespace MyCityCouncil.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDatabase(configuration);
        services.AddJwtConfiguration(configuration);
        services.AddRepositories();
        services.AddServices();
        return services;
    }

    private static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsql => npgsql.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)
            ));

        return services;
    }
    
    private static void AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<ICommitteeRepository, CommitteeRepository>();
        services.AddScoped<IInitiativeRepository, InitiativeRepository>();
        services.AddScoped<ISessionRepository, SessionRepository>();
        services.AddScoped<IVoteRepository, VoteRepository>();
        services.AddScoped<IVotingRepository, VotingRepository>();
        services.AddScoped<ISessionAttendeeRepository, SessionAttendeeRepository>();
        services.AddScoped<IPartyRepository, PartyRepository>();
    }
    
    private static void AddServices(this IServiceCollection services)
    {
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
    }
    
    private static IServiceCollection AddJwtConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection("JwtOptions"));
        return services;
    }
}