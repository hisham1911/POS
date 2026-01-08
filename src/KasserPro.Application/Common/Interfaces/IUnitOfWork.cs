namespace KasserPro.Application.Common.Interfaces;

using KasserPro.Domain.Entities;
using Microsoft.EntityFrameworkCore.Storage;

public interface IUnitOfWork : IDisposable
{
    IRepository<Tenant> Tenants { get; }
    IRepository<Branch> Branches { get; }
    IRepository<User> Users { get; }
    IRepository<Category> Categories { get; }
    IRepository<Product> Products { get; }
    IRepository<Order> Orders { get; }
    IRepository<OrderItem> OrderItems { get; }
    IRepository<Payment> Payments { get; }
    IRepository<Shift> Shifts { get; }
    IRepository<AuditLog> AuditLogs { get; }
    
    // Sellable V1: New repositories
    IRepository<Customer> Customers { get; }
    IRepository<StockMovement> StockMovements { get; }
    IRepository<RefundLog> RefundLogs { get; }

    Task<int> SaveChangesAsync();
    
    /// <summary>
    /// Begin a database transaction for atomic operations
    /// </summary>
    Task<IDbContextTransaction> BeginTransactionAsync();
}
