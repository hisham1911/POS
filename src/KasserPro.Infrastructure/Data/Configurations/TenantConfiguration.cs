namespace KasserPro.Infrastructure.Data.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using KasserPro.Domain.Entities;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.NameEn)
            .HasMaxLength(200);

        builder.Property(t => t.Slug)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(t => t.LogoUrl)
            .HasMaxLength(500);

        builder.Property(t => t.Currency)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("EGP");

        builder.Property(t => t.Timezone)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("Africa/Cairo");

        // Tax Settings
        builder.Property(t => t.TaxRate)
            .HasPrecision(5, 2)
            .HasDefaultValue(14.0m);

        builder.Property(t => t.IsTaxEnabled)
            .HasDefaultValue(true);
    }
}
