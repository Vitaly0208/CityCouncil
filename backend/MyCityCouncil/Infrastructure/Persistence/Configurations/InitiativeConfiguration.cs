
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Infrastructure.Persistence.Configurations;

public class InitiativeConfiguration : IEntityTypeConfiguration<Initiative>
{
    public void Configure(EntityTypeBuilder<Initiative> builder)
    {
        builder.ToTable("Initiatives");
        builder.HasKey(i => i.Id);

        // 1. Текстовые поля
        builder.Property(i => i.Title).HasMaxLength(200).IsRequired();
        builder.Property(i => i.Description).HasMaxLength(5000).IsRequired();

        // 2. Статус: храним как строку для читаемости в БД (вместо int)
        builder.Property(i => i.Status)
               .HasConversion<string>()
               .HasMaxLength(50);

        // 3. Даты
        builder.Property(i => i.CreatedAt).HasDefaultValueSql("NOW()").IsRequired();
        builder.Property(i => i.ApprovedAt).IsRequired(false); // ⚠️ См. примечание ниже
        builder.Property(i => i.FinalizedAt).IsRequired(false);

        // 4. Связь с автором (User)
        builder.HasOne(i => i.User)
               .WithMany() // Если в User нет коллекции Initiatives
               .HasForeignKey(i => i.UserId)
               .OnDelete(DeleteBehavior.Restrict); // 🛡️ Не удалять инициативы при удалении автора

        // 6. Индексы для оптимизации запросов
        // Фильтрация по статусу (поиск на модерации, в очереди, принятые)
        builder.HasIndex(i => i.Status)
               .HasDatabaseName("IX_Initiatives_Status");
        
        // WHERE Status = 'InQueue' ORDER BY ApprovedAt ASC LIMIT 3
        builder.HasIndex(i => new { i.Status, i.ApprovedAt })
               .HasDatabaseName("IX_Initiatives_QueueSorting");
    }
}