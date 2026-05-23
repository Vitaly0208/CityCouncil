using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Infrastructure.Persistence.Configurations;

public class SessionAttendeeConfiguration : IEntityTypeConfiguration<SessionAttendee>
{
    public void Configure(EntityTypeBuilder<SessionAttendee> builder)
    {
        builder.ToTable("SessionAttendees");
        
        builder.HasKey(sa => sa.Id);
        
        builder.HasIndex(sa => new { sa.SessionId, sa.UserId })
            .IsUnique();
        
        builder.HasOne(sa => sa.Session)
            .WithMany(s => s.Attendees)
            .HasForeignKey(sa => sa.SessionId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(sa => sa.User)
            .WithMany()
            .HasForeignKey(sa => sa.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.Property(sa => sa.JoinedAt)
            .IsRequired();
    }
}