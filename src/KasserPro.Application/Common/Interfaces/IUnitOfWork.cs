namespace KasserPro.Application.Common.Interfaces;

using KasserPro.Domain.Entities;

public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<Category> Categories { get; }
    IRepository<Product> Products { get; }
    IRepository<Order> Orders { get; }
    IRepository<OrderItem> OrderItems { get; }
    IRepository<Payment> Payments { get; }
    IRepository<Shift> Shifts { get; }

    Task<int> SaveChangesAsync();
}
