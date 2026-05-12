namespace MyCityCouncil.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyCityCouncil.Domain.Models;


public class CommitteeInfoConfiguration : IEntityTypeConfiguration<CommitteeInfo>
{
    public void Configure(EntityTypeBuilder<CommitteeInfo> builder)
    {
        builder.ToTable("CommitteesInfo");
        builder.HasKey(c => c.Id);

        // 1. Поля данных
        builder.Property(c => c.CStatus)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(c => c.AppointedAt).IsRequired();
        builder.Property(c => c.DismissedAt).IsRequired(false);
        
        builder.HasCheckConstraint("CK_CommitteesInfo_DateRange", 
            "\"DismissedAt\" IS NULL OR \"DismissedAt\" >= \"AppointedAt\"");

        // 2. Связь User → CommitteesInfo
        builder
            .HasOne(c => c.User)
            .WithMany(u => u.CommitteesMemberships)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder
            .HasIndex(c => new { c.CommitteeId, c.IsChairman })
            .HasDatabaseName("IX_CommitteesInfo_OneActiveChairman")
            .IsUnique()
            .HasFilter("\"IsChairman\" = true AND \"DismissedAt\" IS NULL");

        // 3. Связь Committee → CommitteesInfo
        builder
            .HasOne(c => c.Committee)
            .WithMany(cm => cm.Memberships)
            .HasForeignKey(c => c.CommitteeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(c => c.UserId)
            .HasDatabaseName("IX_CommitteesInfo_UserId");

        // Быстрый поиск действующих членов конкретной комиссии
        builder.HasIndex(c => new { c.CommitteeId, c.DismissedAt })
            .HasDatabaseName("IX_CommitteesInfo_CommitteeActiveStatus");
        
        builder.HasIndex(c => new { c.CommitteeId, c.AppointedAt, c.DismissedAt })
            .HasDatabaseName("IX_CommitteesInfo_HistoryRange");
    }
}