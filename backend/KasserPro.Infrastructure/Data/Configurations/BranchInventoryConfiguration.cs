namespace KasserPro.Infrastructure.Data.Configurations;

using KasserPro.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class BranchInventoryConfiguration : IEntityTypeConfiguration<BranchInventory>
{
    public void Configure(EntityTypeBuilder<BranchInventory> builder)
    {
        builder.ToTable("BranchInventories");
        
        // Primary Key
        builder.HasKey(e => e.Id);
        
        // Unique constraint: One inventory record per (Branch, Product)
        builder.HasIndex(e => new { e.BranchId, e.ProductId })
            .IsUnique()
            .HasDatabaseName("IX_BranchInventories_BranchId_ProductId");
        
        // Indexes for performance
        builder.HasIndex(e => new { e.TenantId, e.BranchId })
            .HasDatabaseName("IX_BranchInventories_TenantId_BranchId");
        
        builder.HasIndex(e => e.Quantity)
            .HasDatabaseName("IX_BranchInventories_Quantity");
        
        builder.HasIndex(e => e.LastUpdatedAt)
            .HasDatabaseName("IX_BranchInventories_LastUpdatedAt");
        
        // Properties
        builder.Property(e => e.Quantity)
            .IsRequired();
        
        builder.Property(e => e.LastUpdatedAt)
            .IsRequired();
        
        // Relationships
        builder.HasOne(e => e.Tenant)
            .WithMany()
            .HasForeignKey(e => e.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(e => e.Branch)
            .WithMany(b => b.Inventories)
            .HasForeignKey(e => e.BranchId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(e => e.Product)
            .WithMany(p => p.BranchInventories)
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
