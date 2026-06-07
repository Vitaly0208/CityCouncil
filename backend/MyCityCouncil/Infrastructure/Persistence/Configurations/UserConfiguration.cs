using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(u => u.Id);
        
        builder.Property(u => u.FirstName).HasMaxLength(50).IsRequired();
        builder.Property(u => u.LastName).HasMaxLength(50).IsRequired();
        builder.Property(u => u.MiddleName).HasMaxLength(50).IsRequired(false);
        builder.Property(u => u.PasswordHash).HasMaxLength(256).IsRequired();
        builder.Property(u => u.Email).HasMaxLength(150).IsRequired();
        builder.Property(u => u.HomePhone).HasMaxLength(20).IsRequired(false);
        builder.Property(u => u.RatingScore).HasDefaultValue(0);
        builder.Property(u => u.WorkPhone).HasMaxLength(20).IsRequired(false);

        builder
            .HasIndex(u => u.Email)
            .IsUnique();
        
        builder.Property(u => u.CreatedAt).HasDefaultValueSql("NOW()");
        
        builder
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}