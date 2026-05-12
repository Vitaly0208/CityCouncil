using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Infrastructure.Persistence.Configurations;

public class SessionConfiguration : IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder.ToTable("Sessions");
        builder.HasKey(s => s.Id);

        // 1. Текстовые поля
        builder.Property(s => s.Title)
            .HasMaxLength(200)
            .IsRequired();
        
        builder.Property(s => s.Location)
            .HasMaxLength(200)
            .IsRequired(false);

        // 2. Даты
        builder.Property(s => s.HeldAt).IsRequired();
        builder.Property(s => s.CreatedAt)
            .HasDefaultValueSql("NOW()") // ⚠️ Для PostgreSQL. Для SQL Server замени на GETUTCDATE()
            .IsRequired();

        // 3. Связь с комитетом
        builder.HasOne(s => s.Committee)
            .WithMany() // Если в Committee есть List<Session> Sessions → замени на .WithMany(c => c.Sessions)
            .HasForeignKey(s => s.CommitteeId)
            .OnDelete(DeleteBehavior.Restrict);

        // 5. Индексы для типичных сценариев
        // Календарь / таймлайн: поиск заседаний по дате
        builder.HasIndex(s => s.HeldAt)
            .HasDatabaseName("IX_Sessions_HeldAt");

        // История заседаний конкретного комитета (самый частый запрос)
        builder.HasIndex(s => new { s.CommitteeId, s.HeldAt })
            .HasDatabaseName("IX_Sessions_CommitteeDate");
    }
}