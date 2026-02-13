namespace KasserPro.Infrastructure.Data.Configurations;

using KasserPro.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class InventoryTransferConfiguration : IEntityTypeConfiguration<InventoryTransfer>
{
    public void Configure(EntityTypeBuilder<InventoryTransfer> builder)
    {
        builder.ToTable("InventoryTransfers");
        
        // Primary Key
        builder.HasKey(e => e.Id);
        
        // Unique constraint: Transfer number must be unique
        builder.HasIndex(e => e.TransferNumber)
            .IsUnique()
            .HasDatabaseName("IX_InventoryTransfers_TransferNumber");
        
        // Indexes for performance
        builder.HasIndex(e => new { e.TenantId, e.Status })
            .HasDatabaseName("IX_InventoryTransfers_TenantId_Status");
        
        builder.HasIndex(e => new { e.FromBranchId, e.Status })
            .HasDatabaseName("IX_InventoryTransfers_FromBranchId_Status");
        
        builder.HasIndex(e => new { e.ToBranchId, e.Status })
            .HasDatabaseName("IX_InventoryTransfers_ToBranchId_Status");
        
        builder.HasIndex(e => e.ProductId)
            .HasDatabaseName("IX_InventoryTransfers_ProductId");
        
        builder.HasIndex(e => e.CreatedAt)
            .HasDatabaseName("IX_InventoryTransfers_CreatedAt");
        
        // Properties
        builder.Property(e => e.TransferNumber)
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(e => e.ProductName)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(e => e.ProductSku)
            .HasMaxLength(100);
        
        builder.Property(e => e.Quantity)
            .IsRequired();
        
        builder.Property(e => e.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
        
        builder.Property(e => e.Reason)
            .IsRequired()
            .HasMaxLength(500);
        
        builder.Property(e => e.Notes)
            .HasMaxLength(1000);
        
        builder.Property(e => e.CreatedByUserName)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(e => e.ApprovedByUserName)
            .HasMaxLength(100);
        
        builder.Property(e => e.ReceivedByUserName)
            .HasMaxLength(100);
        
        builder.Property(e => e.CancelledByUserName)
            .HasMaxLength(100);
        
        builder.Property(e => e.CancellationReason)
            .HasMaxLength(500);
        
        // Relationships
        builder.HasOne(e => e.Tenant)
            .WithMany()
            .HasForeignKey(e => e.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(e => e.FromBranch)
            .WithMany(b => b.TransfersFrom)
            .HasForeignKey(e => e.FromBranchId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(e => e.ToBranch)
            .WithMany(b => b.TransfersTo)
            .HasForeignKey(e => e.ToBranchId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(e => e.Product)
            .WithMany(p => p.InventoryTransfers)
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(e => e.CreatedByUser)
            .WithMany()
            .HasForeignKey(e => e.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(e => e.ApprovedByUser)
            .WithMany()
            .HasForeignKey(e => e.ApprovedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(e => e.ReceivedByUser)
            .WithMany()
            .HasForeignKey(e => e.ReceivedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
