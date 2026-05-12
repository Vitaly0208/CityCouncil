using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Infrastructure.Persistence.Configurations;

public class VotingInfoConfiguration : IEntityTypeConfiguration<VotingInfo>
{
    public void Configure(EntityTypeBuilder<VotingInfo> builder)
    {
        builder.ToTable("VotingInfos");
        builder.HasKey(v => v.Id);
        
        builder.Property(v => v.SessionTitle)
               .HasMaxLength(200)
               .IsRequired();
        
        builder.Property(v => v.InitiativeTitle)
               .HasMaxLength(200)
               .IsRequired();

        // 2. Статус инициативы: храним как строку для читаемости в БД
        builder.Property(v => v.Status)
               .HasConversion<string>()
               .HasMaxLength(50);

        // 3. Счётчики и даты
        builder.Property(v => v.VotesFor).HasDefaultValue(0);
        builder.Property(v => v.VotesAgainst).HasDefaultValue(0);
        builder.Property(v => v.VotedAt).HasDefaultValueSql("NOW()");
        builder.Property(v => v.IsFinalized).HasDefaultValue(false);

        // 4. Связь с Session
        builder.HasOne(v => v.Session)
               .WithMany(s => s.VotingResults)
               .HasForeignKey(v => v.SessionId)
               .OnDelete(DeleteBehavior.Restrict);

        // 5. Связь с Initiative
        builder.HasOne(v => v.Initiative)
               .WithMany(i => i.VotingHistory)
               .HasForeignKey(v => v.InitiativeId)
               .OnDelete(DeleteBehavior.Restrict);

        // 6. Уникальный констрейнт: одна инициатива → одно голосование на одно заседание
        builder.HasIndex(v => new { v.SessionId, v.InitiativeId })
               .IsUnique()
               .HasDatabaseName("UQ_VotingInfos_SessionInitiative");

        // Индекс для быстрого поиска не финализированных итогов
        builder.HasIndex(v => v.IsFinalized)
               .HasDatabaseName("IX_VotingInfos_IsFinalized");
    }
}