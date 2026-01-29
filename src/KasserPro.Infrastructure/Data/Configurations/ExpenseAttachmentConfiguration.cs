namespace KasserPro.Infrastructure.Data.Configurations;

using KasserPro.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ExpenseAttachmentConfiguration : IEntityTypeConfiguration<ExpenseAttachment>
{
    public void Configure(EntityTypeBuilder<ExpenseAttachment> builder)
    {
        builder.ToTable("ExpenseAttachments");
        
        // Primary key
        builder.HasKey(a => a.Id);
        
        // Indexes
        builder.HasIndex(a => a.ExpenseId);
        builder.HasIndex(a => a.UploadedByUserId);
        
        // Properties
        builder.Property(a => a.FileName)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(a => a.FilePath)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(a => a.FileType)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(a => a.UploadedByUserName)
            .IsRequired()
            .HasMaxLength(100);
        
        // Relationships
        builder.HasOne(a => a.Expense)
            .WithMany(e => e.Attachments)
            .HasForeignKey(a => a.ExpenseId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(a => a.UploadedByUser)
            .WithMany()
            .HasForeignKey(a => a.UploadedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
