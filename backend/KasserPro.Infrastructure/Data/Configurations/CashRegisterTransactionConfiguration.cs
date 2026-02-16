namespace KasserPro.Infrastructure.Data.Configurations;

using KasserPro.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class CashRegisterTransactionConfiguration : IEntityTypeConfiguration<CashRegisterTransaction>
{
    public void Configure(EntityTypeBuilder<CashRegisterTransaction> builder)
    {
        builder.ToTable("CashRegisterTransactions");
        
        // Primary key
        builder.HasKey(t => t.Id);
        
        // Indexes
        builder.HasIndex(t => new { t.TenantId, t.BranchId });
        builder.HasIndex(t => t.TransactionNumber).IsUnique();
        builder.HasIndex(t => t.Type);
        builder.HasIndex(t => t.TransactionDate);
        builder.HasIndex(t => t.ShiftId);
        builder.HasIndex(t => new { t.ReferenceType, t.ReferenceId });
        builder.HasIndex(t => t.TransferReferenceId);
        builder.HasIndex(t => t.UserId);
        
        // Properties
        builder.Property(t => t.TransactionNumber)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(t => t.Amount)
            .HasColumnType("decimal(18,2)");
            
        builder.Property(t => t.BalanceBefore)
            .HasColumnType("decimal(18,2)");
            
        builder.Property(t => t.BalanceAfter)
            .HasColumnType("decimal(18,2)");
            
        builder.Property(t => t.Description)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(t => t.ReferenceType)
            .HasMaxLength(50);
            
        builder.Property(t => t.UserName)
            .IsRequired()
            .HasMaxLength(100);
        
        // Enum conversion
        builder.Property(t => t.Type)
            .HasConversion<string>()
            .HasMaxLength(20);
        
        // Relationships
        builder.HasOne(t => t.Tenant)
            .WithMany()
            .HasForeignKey(t => t.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(t => t.Branch)
            .WithMany()
            .HasForeignKey(t => t.BranchId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(t => t.Shift)
            .WithMany(s => s.CashRegisterTransactions)
            .HasForeignKey(t => t.ShiftId)
            .OnDelete(DeleteBehavior.SetNull);
            
        builder.HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
