using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Infrastructure.Persistence.Configurations;

public class CommitteeConfiguration : IEntityTypeConfiguration<Committee>
{
    public void Configure(EntityTypeBuilder<Committee> builder)
    {
        builder.ToTable("Committees");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(c => c.Specialization)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.Description)
            .HasMaxLength(2000)
            .IsRequired(false);
        
        builder.HasIndex(c => c.Name)
            .IsUnique()
            .HasDatabaseName("IX_Committees_Name");
        
        builder.HasIndex(c => c.Specialization)
            .HasDatabaseName("IX_Committees_Specialization");
        
        builder.HasQueryFilter(c => !c.IsArchived);
    }
}