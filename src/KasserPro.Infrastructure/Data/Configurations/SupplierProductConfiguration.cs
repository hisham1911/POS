namespace KasserPro.Infrastructure.Data.Configurations;

using KasserPro.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class SupplierProductConfiguration : IEntityTypeConfiguration<SupplierProduct>
{
    public void Configure(EntityTypeBuilder<SupplierProduct> builder)
    {
        // Composite unique index
        builder.HasIndex(e => new { e.SupplierId, e.ProductId }).IsUnique();
        builder.HasIndex(e => new { e.ProductId, e.IsPreferred });
        
        // Relationships
        builder.HasOne(e => e.Supplier)
            .WithMany(s => s.SupplierProducts)
            .HasForeignKey(e => e.SupplierId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(e => e.Product)
            .WithMany(p => p.SupplierProducts)
            .HasForeignKey(e => e.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Decimal precision
        builder.Property(e => e.LastPurchasePrice).HasPrecision(18, 2);
        builder.Property(e => e.TotalAmountSpent).HasPrecision(18, 2);
    }
}
