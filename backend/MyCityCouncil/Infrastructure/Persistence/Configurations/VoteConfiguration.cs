using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Infrastructure.Persistence.Configurations;

public class VoteConfiguration : IEntityTypeConfiguration<Vote>
{
    public void Configure(EntityTypeBuilder<Vote> builder)
    {
        // 1. Имя таблицы в БД
        builder.ToTable("Votes");

        // 2. Первичный ключ
        builder.HasKey(v => v.Id);

        // 3. Связь с VotingInfo (Многие к Одному)
        // Один VotingInfo может иметь много голосов (Vote)
        builder.HasOne(v => v.VotingInfo)
            .WithMany(vi => vi.Votes)
            .HasForeignKey(v => v.VotingInfoId)
            .OnDelete(DeleteBehavior.Cascade); 
        // Cascade: если удалят запись из VotingInfo, удалятся и голоса.
        // Можно поменять на Restrict, если голоса нужно хранить как историю.

        // 4. УНИКАЛЬНЫЙ ИНДЕКС (Критично для голосования!)
        // Запрещает одному и тому же пользователю голосовать за одну и ту же инициативу дважды
        builder.HasIndex(v => new { v.VotingInfoId, v.VoterId }).IsUnique();

        // 5. Настройка свойств
        builder.Property(v => v.VoterId)
            .IsRequired();

        // Храним enum как строку ("For", "Against") для читаемости в БД
        builder.Property(v => v.Type)
            .HasConversion<string>() 
            .HasMaxLength(20);

        builder.Property(v => v.VotedAt)
            .IsRequired();
    }
}