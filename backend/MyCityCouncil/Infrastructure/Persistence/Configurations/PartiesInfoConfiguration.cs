using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Infrastructure.Persistence.Configurations;

public class PartiesInfoConfiguration : IEntityTypeConfiguration<PartiesInfo>
{
    public void Configure(EntityTypeBuilder<PartiesInfo> builder)
    {
        builder.ToTable("PartiesInfo");

        builder.HasKey(p => p.Id);

        // Строковые поля
        builder.Property(p => p.PStatus)
            .HasMaxLength(100)
            .IsRequired();

        // Даты
        builder.Property(p => p.AppointedAt).IsRequired();
        builder.Property(p => p.DismissedAt).IsRequired(false);

        // Исключаем вычисляемое свойство из БД
        builder.Ignore(p => p.IsActive);

        // Связь User → PartiesInfo
        builder.HasOne(p => p.User)
            .WithMany(u => u.PartyMemberships) // ⬅️ Сверь имя с твоим классом User
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Связь Party → PartiesInfo
        builder.HasOne(p => p.Party)
            .WithMany(pa => pa.Memberships) // ⬅️ Сверь имя с твоим классом Party
            .HasForeignKey(p => p.PartyId)
            .OnDelete(DeleteBehavior.Restrict);

        // Индекс для быстрого поиска активных записей пользователя
        builder.HasIndex(p => new { p.UserId, p.DismissedAt })
            .HasDatabaseName("IX_PartiesInfo_UserActiveStatus");
    }
}
