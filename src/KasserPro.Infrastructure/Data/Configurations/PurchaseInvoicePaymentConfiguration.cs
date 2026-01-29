namespace KasserPro.Infrastructure.Data.Configurations;

using KasserPro.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class PurchaseInvoicePaymentConfiguration : IEntityTypeConfiguration<PurchaseInvoicePayment>
{
    public void Configure(EntityTypeBuilder<PurchaseInvoicePayment> builder)
    {
        // Indexes
        builder.HasIndex(e => e.PurchaseInvoiceId);
        builder.HasIndex(e => e.PaymentDate);
        
        // Relationships
        builder.HasOne(e => e.CreatedByUser)
            .WithMany()
            .HasForeignKey(e => e.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Decimal precision
        builder.Property(e => e.Amount).HasPrecision(18, 2);
    }
}
