using Microsoft.EntityFrameworkCore;
using MyCityCouncil.Domain.Models;
using MyCityCouncil.Infrastructure.Persistence.Configurations;

namespace MyCityCouncil.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Committee> Committees => Set<Committee>();
    public DbSet<Party> Parties => Set<Party>();
    public DbSet<CommitteeInfo> CommitteeInfos => Set<CommitteeInfo>();
    public DbSet<PartiesInfo> PartiesInfos => Set<PartiesInfo>();
    public DbSet<Initiative> Initiatives => Set<Initiative>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<VotingInfo> VotingInfos => Set<VotingInfo>();
    public  DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Vote> Votes => Set<Vote>();
    public DbSet<SessionAttendee> SessionAttendees => Set<SessionAttendee>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new RoleConfiguration());
        modelBuilder.ApplyConfiguration(new CommitteeConfiguration());
        modelBuilder.ApplyConfiguration(new PartyConfiguration());
        modelBuilder.ApplyConfiguration(new PartiesInfoConfiguration());
        modelBuilder.ApplyConfiguration(new CommitteeInfoConfiguration());
        modelBuilder.ApplyConfiguration(new InitiativeConfiguration());
        modelBuilder.ApplyConfiguration(new SessionConfiguration());
        modelBuilder.ApplyConfiguration(new VotingInfoConfiguration());
        modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());
        modelBuilder.ApplyConfiguration(new VoteConfiguration());
        modelBuilder.ApplyConfiguration(new SessionAttendeeConfiguration());
        
        
        base.OnModelCreating(modelBuilder);
    }
}