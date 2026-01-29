namespace KasserPro.Infrastructure.Data.Configurations;

using KasserPro.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.ToTable("Expenses");
        
        // Primary key
        builder.HasKey(e => e.Id);
        
        // Indexes
        builder.HasIndex(e => new { e.TenantId, e.BranchId });
        builder.HasIndex(e => e.ExpenseNumber).IsUnique();
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.ExpenseDate);
        builder.HasIndex(e => e.CategoryId);
        builder.HasIndex(e => e.ShiftId);
        builder.HasIndex(e => e.CreatedByUserId);
        
        // Properties
        builder.Property(e => e.ExpenseNumber)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(e => e.Amount)
            .HasColumnType("decimal(18,2)");
            
        builder.Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(500);
            
        builder.Property(e => e.Beneficiary)
            .HasMaxLength(200);
            
        builder.Property(e => e.ReferenceNumber)
            .HasMaxLength(100);
            
        builder.Property(e => e.Notes)
            .HasMaxLength(1000);
            
        builder.Property(e => e.PaymentReferenceNumber)
            .HasMaxLength(100);
            
        builder.Property(e => e.CreatedByUserName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(e => e.ApprovedByUserName)
            .HasMaxLength(100);
            
        builder.Property(e => e.PaidByUserName)
            .HasMaxLength(100);
            
        builder.Property(e => e.RejectedByUserName)
            .HasMaxLength(100);
            
        builder.Property(e => e.RejectionReason)
            .HasMaxLength(500);
        
        // Enum conversion
        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(20);
            
        builder.Property(e => e.PaymentMethod)
            .HasConversion<string>()
            .HasMaxLength(20);
        
        // Relationships
        builder.HasOne(e => e.Tenant)
            .WithMany()
            .HasForeignKey(e => e.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(e => e.Branch)
            .WithMany()
            .HasForeignKey(e => e.BranchId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(e => e.Category)
            .WithMany(c => c.Expenses)
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(e => e.Shift)
            .WithMany(s => s.Expenses)
            .HasForeignKey(e => e.ShiftId)
            .OnDelete(DeleteBehavior.SetNull);
            
        builder.HasOne(e => e.CreatedByUser)
            .WithMany()
            .HasForeignKey(e => e.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(e => e.ApprovedByUser)
            .WithMany()
            .HasForeignKey(e => e.ApprovedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(e => e.PaidByUser)
            .WithMany()
            .HasForeignKey(e => e.PaidByUserId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(e => e.RejectedByUser)
            .WithMany()
            .HasForeignKey(e => e.RejectedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasMany(e => e.Attachments)
            .WithOne(a => a.Expense)
            .HasForeignKey(a => a.ExpenseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
