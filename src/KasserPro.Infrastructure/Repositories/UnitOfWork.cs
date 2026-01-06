namespace KasserPro.Infrastructure.Repositories;

using KasserPro.Application.Common.Interfaces;
using KasserPro.Domain.Entities;
using KasserPro.Infrastructure.Data;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Users = new GenericRepository<User>(context);
        Categories = new GenericRepository<Category>(context);
        Products = new GenericRepository<Product>(context);
        Orders = new GenericRepository<Order>(context);
        OrderItems = new GenericRepository<OrderItem>(context);
        Payments = new GenericRepository<Payment>(context);
        Shifts = new GenericRepository<Shift>(context);
    }

    public IRepository<User> Users { get; }
    public IRepository<Category> Categories { get; }
    public IRepository<Product> Products { get; }
    public IRepository<Order> Orders { get; }
    public IRepository<OrderItem> OrderItems { get; }
    public IRepository<Payment> Payments { get; }
    public IRepository<Shift> Shifts { get; }

    public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

    public void Dispose() => _context.Dispose();
}
