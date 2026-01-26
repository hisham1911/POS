namespace KasserPro.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;
using KasserPro.Domain.Entities;

public class AppDbContext : DbContext
{
    private readonly int _currentTenantId;
    private readonly int? _currentBranchId;

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) 
    {
        _currentTenantId = 1; // Default tenant - will be set via middleware later
        _currentBranchId = 1; // Default branch
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Shift> Shifts => Set<Shift>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    
    // Sellable V1: New entities
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<RefundLog> RefundLogs => Set<RefundLog>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Soft delete filters - must be consistent across related entities
        modelBuilder.Entity<Tenant>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Branch>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Category>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Product>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Order>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<OrderItem>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Payment>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Shift>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<AuditLog>().HasQueryFilter(e => !e.IsDeleted);
        
        // Sellable V1: Soft delete filters for new entities
        modelBuilder.Entity<Customer>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<StockMovement>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<RefundLog>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Supplier>().HasQueryFilter(e => !e.IsDeleted);

        // Tenant relationships
        modelBuilder.Entity<Branch>()
            .HasOne(b => b.Tenant)
            .WithMany(t => t.Branches)
            .HasForeignKey(b => b.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Tenant)
            .WithMany(t => t.Users)
            .HasForeignKey(u => u.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Branch)
            .WithMany(b => b.Users)
            .HasForeignKey(u => u.BranchId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Category>()
            .HasOne(c => c.Tenant)
            .WithMany(t => t.Categories)
            .HasForeignKey(c => c.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Tenant)
            .WithMany(t => t.Products)
            .HasForeignKey(p => p.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.Tenant)
            .WithMany()
            .HasForeignKey(o => o.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.Branch)
            .WithMany(b => b.Orders)
            .HasForeignKey(o => o.BranchId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Shift>()
            .HasOne(s => s.Tenant)
            .WithMany()
            .HasForeignKey(s => s.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Shift>()
            .HasOne(s => s.Branch)
            .WithMany(b => b.Shifts)
            .HasForeignKey(s => s.BranchId)
            .OnDelete(DeleteBehavior.Restrict);

        // Concurrency token for Shift (optimistic locking)
        // For SQLite, we use a simple concurrency token instead of rowversion
        if (Database.IsSqlite())
        {
            modelBuilder.Entity<Shift>()
                .Property(s => s.RowVersion)
                .IsConcurrencyToken()
                .HasDefaultValue(Array.Empty<byte>());
        }
        else
        {
            modelBuilder.Entity<Shift>()
                .Property(s => s.RowVersion)
                .IsRowVersion();
        }

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Tenant)
            .WithMany()
            .HasForeignKey(p => p.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Branch)
            .WithMany()
            .HasForeignKey(p => p.BranchId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AuditLog>()
            .HasOne(a => a.Tenant)
            .WithMany()
            .HasForeignKey(a => a.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AuditLog>()
            .HasOne(a => a.Branch)
            .WithMany()
            .HasForeignKey(a => a.BranchId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AuditLog>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        modelBuilder.Entity<Tenant>().HasIndex(t => t.Slug).IsUnique();
        modelBuilder.Entity<Branch>().HasIndex(b => new { b.TenantId, b.Code }).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<AuditLog>().HasIndex(a => new { a.TenantId, a.CreatedAt });
        modelBuilder.Entity<AuditLog>().HasIndex(a => new { a.EntityType, a.EntityId });
        
        // ═══════════════════════════════════════════════════════════════════════
        // SELLABLE V1: Customer, StockMovement, RefundLog configurations
        // ═══════════════════════════════════════════════════════════════════════
        
        // Customer relationships
        modelBuilder.Entity<Customer>()
            .HasOne(c => c.Tenant)
            .WithMany()
            .HasForeignKey(c => c.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<Customer>()
            .HasMany(c => c.Orders)
            .WithOne(o => o.Customer)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);
        
        // Customer indexes (phone lookup is primary use case)
        modelBuilder.Entity<Customer>()
            .HasIndex(c => new { c.TenantId, c.Phone })
            .IsUnique();
        
        // StockMovement relationships
        modelBuilder.Entity<StockMovement>()
            .HasOne(sm => sm.Tenant)
            .WithMany()
            .HasForeignKey(sm => sm.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<StockMovement>()
            .HasOne(sm => sm.Branch)
            .WithMany()
            .HasForeignKey(sm => sm.BranchId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<StockMovement>()
            .HasOne(sm => sm.Product)
            .WithMany(p => p.StockMovements)
            .HasForeignKey(sm => sm.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<StockMovement>()
            .HasOne(sm => sm.User)
            .WithMany()
            .HasForeignKey(sm => sm.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // StockMovement indexes (history queries)
        modelBuilder.Entity<StockMovement>()
            .HasIndex(sm => new { sm.ProductId, sm.CreatedAt });
        
        // RefundLog relationships
        modelBuilder.Entity<RefundLog>()
            .HasOne(rl => rl.Tenant)
            .WithMany()
            .HasForeignKey(rl => rl.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<RefundLog>()
            .HasOne(rl => rl.Branch)
            .WithMany()
            .HasForeignKey(rl => rl.BranchId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<RefundLog>()
            .HasOne(rl => rl.Order)
            .WithOne(o => o.RefundLog)
            .HasForeignKey<RefundLog>(rl => rl.OrderId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<RefundLog>()
            .HasOne(rl => rl.User)
            .WithMany()
            .HasForeignKey(rl => rl.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // RefundLog indexes
        modelBuilder.Entity<RefundLog>()
            .HasIndex(rl => rl.OrderId)
            .IsUnique();
        
        // Product indexes for barcode/SKU lookup (POS scanning)
        modelBuilder.Entity<Product>()
            .HasIndex(p => new { p.TenantId, p.Barcode });
        
        modelBuilder.Entity<Product>()
            .HasIndex(p => new { p.TenantId, p.Sku });
        
        // Supplier relationships
        modelBuilder.Entity<Supplier>()
            .HasOne(s => s.Tenant)
            .WithMany()
            .HasForeignKey(s => s.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<Supplier>()
            .HasOne(s => s.Branch)
            .WithMany()
            .HasForeignKey(s => s.BranchId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Supplier indexes
        modelBuilder.Entity<Supplier>()
            .HasIndex(s => new { s.TenantId, s.Name });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<Domain.Common.BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
