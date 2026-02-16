namespace KasserPro.Infrastructure.Data.Configurations;

using KasserPro.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class BranchProductPriceConfiguration : IEntityTypeConfiguration<BranchProductPrice>
{
    public void Configure(EntityTypeBuilder<BranchProductPrice> builder)
    {
        builder.ToTable("BranchProductPrices");
        
        // Primary Key
        builder.HasKey(e => e.Id);
        
        // Unique constraint: One active price per (Branch, Product)
        builder.HasIndex(e => new { e.BranchId, e.ProductId, e.IsActive })
            .HasDatabaseName("IX_BranchProductPrices_BranchId_ProductId_IsActive");
        
        // Indexes for performance
        builder.HasIndex(e => new { e.TenantId, e.BranchId })
            .HasDatabaseName("IX_BranchProductPrices_TenantId_BranchId");
        
        builder.HasIndex(e => e.EffectiveFrom)
            .HasDatabaseName("IX_BranchProductPrices_EffectiveFrom");
        
        // Properties
        builder.Property(e => e.Price)
            .HasPrecision(18, 2)
            .IsRequired();
        
        builder.Property(e => e.EffectiveFrom)
            .IsRequired();
        
        builder.Property(e => e.IsActive)
            .IsRequired()
            .HasDefaultValue(true);
        
        // Relationships
        builder.HasOne(e => e.Tenant)
            .WithMany()
            .HasForeignKey(e => e.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(e => e.Branch)
            .WithMany(b => b.ProductPrices)
            .HasForeignKey(e => e.BranchId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(e => e.Product)
            .WithMany(p => p.BranchPrices)
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
