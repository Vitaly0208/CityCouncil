using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Infrastructure.Persistence.Configurations;

public class PartyConfiguration : IEntityTypeConfiguration<Party>
{
    public void Configure(EntityTypeBuilder<Party> builder)
    {
        builder.ToTable("Party");
        builder.HasKey(p => p.Id);
        
        builder.Property(p => p.Name)
            .HasMaxLength(100)
            .IsRequired();
        
        builder.Property(p => p.Ideology)
            .HasMaxLength(1000)
            .IsRequired();
        
        
    }
}