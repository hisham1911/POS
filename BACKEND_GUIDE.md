# 🔧 Backend Development Guide - KasserPro MVP

## دليل تطوير الـ Backend باستخدام .NET 8 + Clean Architecture

> **الهدف:** بناء API احترافي وسهل الصيانة والتطوير
>
> **التقنيات:** .NET 8, Entity Framework Core, SQLite, JWT
>
> **المبادئ:** Clean Architecture, SOLID, Repository Pattern

---

## 📑 جدول المحتويات

1. [هيكل المشروع](#-هيكل-المشروع-project-structure)
2. [إعداد المشروع](#-إعداد-المشروع-project-setup)
3. [طبقات Clean Architecture](#-طبقات-clean-architecture)
4. [قاعدة البيانات](#-قاعدة-البيانات-database)
5. [الـ APIs المطلوبة للـ MVP](#-apis-المطلوبة-للـ-mvp)
6. [Authentication & Authorization](#-authentication--authorization)
7. [أفضل الممارسات](#-أفضل-الممارسات-best-practices)
8. [خطوات التنفيذ](#-خطوات-التنفيذ-step-by-step)

---

## 📁 هيكل المشروع (Project Structure)

```
KasserPro/
├── 📁 src/
│   ├── 📁 KasserPro.Domain/              # 🔵 الطبقة الأساسية (Entities)
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── Product.cs
│   │   │   ├── Category.cs
│   │   │   ├── Order.cs
│   │   │   ├── OrderItem.cs
│   │   │   ├── Payment.cs
│   │   │   └── Shift.cs
│   │   ├── Enums/
│   │   │   ├── OrderStatus.cs
│   │   │   ├── PaymentMethod.cs
│   │   │   └── UserRole.cs
│   │   ├── Common/
│   │   │   └── BaseEntity.cs
│   │   └── KasserPro.Domain.csproj
│   │
│   ├── 📁 KasserPro.Application/         # 🟢 طبقة التطبيق (Business Logic)
│   │   ├── Common/
│   │   │   ├── Interfaces/
│   │   │   │   ├── IUnitOfWork.cs
│   │   │   │   └── IRepository.cs
│   │   │   ├── Mappings/
│   │   │   │   └── MappingProfile.cs
│   │   │   └── Exceptions/
│   │   │       ├── NotFoundException.cs
│   │   │       └── ValidationException.cs
│   │   ├── DTOs/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginRequest.cs
│   │   │   │   └── LoginResponse.cs
│   │   │   ├── Products/
│   │   │   │   ├── ProductDto.cs
│   │   │   │   ├── CreateProductRequest.cs
│   │   │   │   └── UpdateProductRequest.cs
│   │   │   ├── Orders/
│   │   │   │   ├── OrderDto.cs
│   │   │   │   ├── CreateOrderRequest.cs
│   │   │   │   └── OrderItemDto.cs
│   │   │   └── Common/
│   │   │       ├── ApiResponse.cs
│   │   │       └── PaginatedList.cs
│   │   ├── Services/
│   │   │   ├── Interfaces/
│   │   │   │   ├── IAuthService.cs
│   │   │   │   ├── IProductService.cs
│   │   │   │   ├── IOrderService.cs
│   │   │   │   └── IShiftService.cs
│   │   │   └── Implementations/
│   │   │       ├── AuthService.cs
│   │   │       ├── ProductService.cs
│   │   │       ├── OrderService.cs
│   │   │       └── ShiftService.cs
│   │   └── KasserPro.Application.csproj
│   │
│   ├── 📁 KasserPro.Infrastructure/      # 🟡 طبقة البنية التحتية (Database, External)
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── Configurations/
│   │   │   │   ├── UserConfiguration.cs
│   │   │   │   ├── ProductConfiguration.cs
│   │   │   │   └── OrderConfiguration.cs
│   │   │   └── Migrations/
│   │   ├── Repositories/
│   │   │   ├── GenericRepository.cs
│   │   │   └── UnitOfWork.cs
│   │   └── KasserPro.Infrastructure.csproj
│   │
│   └── 📁 KasserPro.API/                 # 🔴 طبقة العرض (Controllers, Middleware)
│       ├── Controllers/
│       │   ├── AuthController.cs
│       │   ├── ProductsController.cs
│       │   ├── CategoriesController.cs
│       │   ├── OrdersController.cs
│       │   ├── PaymentsController.cs
│       │   └── ShiftsController.cs
│       ├── Middleware/
│       │   ├── ExceptionMiddleware.cs
│       │   └── RequestLoggingMiddleware.cs
│       ├── Extensions/
│       │   └── ServiceCollectionExtensions.cs
│       ├── appsettings.json
│       ├── appsettings.Development.json
│       ├── Program.cs
│       └── KasserPro.API.csproj
│
├── 📁 tests/
│   └── KasserPro.Tests/
│
├── KasserPro.sln
└── README.md
```

---

## 🚀 إعداد المشروع (Project Setup)

### الخطوة 1: إنشاء الحل والمشاريع

```powershell
# إنشاء المجلد الرئيسي
mkdir KasserPro
cd KasserPro

# إنشاء الحل
dotnet new sln -n KasserPro

# إنشاء المشاريع
dotnet new classlib -n KasserPro.Domain -o src/KasserPro.Domain
dotnet new classlib -n KasserPro.Application -o src/KasserPro.Application
dotnet new classlib -n KasserPro.Infrastructure -o src/KasserPro.Infrastructure
dotnet new webapi -n KasserPro.API -o src/KasserPro.API

# إضافة المشاريع للحل
dotnet sln add src/KasserPro.Domain
dotnet sln add src/KasserPro.Application
dotnet sln add src/KasserPro.Infrastructure
dotnet sln add src/KasserPro.API

# إضافة المراجع بين المشاريع
cd src/KasserPro.Application
dotnet add reference ../KasserPro.Domain

cd ../KasserPro.Infrastructure
dotnet add reference ../KasserPro.Domain
dotnet add reference ../KasserPro.Application

cd ../KasserPro.API
dotnet add reference ../KasserPro.Application
dotnet add reference ../KasserPro.Infrastructure
```

### الخطوة 2: تثبيت الحزم المطلوبة

```powershell
# في KasserPro.Infrastructure
cd src/KasserPro.Infrastructure
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Microsoft.EntityFrameworkCore.Design

# في KasserPro.Application
cd ../KasserPro.Application
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
dotnet add package FluentValidation.DependencyInjectionExtensions

# في KasserPro.API
cd ../KasserPro.API
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Swashbuckle.AspNetCore
dotnet add package Serilog.AspNetCore
```

---

## 🏗️ طبقات Clean Architecture

### لماذا Clean Architecture؟

```
✅ سهولة الاختبار (Testing)
✅ سهولة الصيانة (Maintainability)
✅ مرونة التغيير (Flexibility)
✅ فصل المسؤوليات (Separation of Concerns)
```

### 🔵 Domain Layer (الطبقة الأساسية)

```csharp
// src/KasserPro.Domain/Common/BaseEntity.cs
namespace KasserPro.Domain.Common;

public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;
}
```

```csharp
// src/KasserPro.Domain/Enums/OrderStatus.cs
namespace KasserPro.Domain.Enums;

public enum OrderStatus
{
    Draft = 0,      // طلب مفتوح
    Pending = 1,    // في الانتظار
    Completed = 2,  // مكتمل
    Cancelled = 3,  // ملغي
    Refunded = 4    // مسترجع
}
```

```csharp
// src/KasserPro.Domain/Enums/PaymentMethod.cs
namespace KasserPro.Domain.Enums;

public enum PaymentMethod
{
    Cash = 0,       // نقدي
    Card = 1,       // بطاقة
    Mada = 2        // مدى
}
```

```csharp
// src/KasserPro.Domain/Enums/UserRole.cs
namespace KasserPro.Domain.Enums;

public enum UserRole
{
    Admin = 0,      // مدير
    Cashier = 1     // كاشير
}
```

```csharp
// src/KasserPro.Domain/Entities/User.cs
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

public class User : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public UserRole Role { get; set; } = UserRole.Cashier;
    public bool IsActive { get; set; } = true;
    public string? PinCode { get; set; }  // للدخول السريع

    // Navigation
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Shift> Shifts { get; set; } = new List<Shift>();
}
```

```csharp
// src/KasserPro.Domain/Entities/Category.cs
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
```

```csharp
// src/KasserPro.Domain/Entities/Product.cs
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Description { get; set; }
    public string? Sku { get; set; }
    public string? Barcode { get; set; }
    public decimal Price { get; set; }
    public decimal? Cost { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public bool TrackInventory { get; set; } = false;
    public int? StockQuantity { get; set; }

    // Foreign Keys
    public int CategoryId { get; set; }

    // Navigation
    public Category Category { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
```

```csharp
// src/KasserPro.Domain/Entities/Order.cs
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public OrderStatus Status { get; set; } = OrderStatus.Draft;

    // Amounts (Snapshot - لا تتغير بعد الإكمال)
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal TaxRate { get; set; } = 15; // VAT %
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }

    // Payment
    public decimal AmountPaid { get; set; } = 0;
    public decimal ChangeAmount { get; set; } = 0;

    // Customer (Optional)
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }

    // Notes
    public string? Notes { get; set; }

    // Timestamps
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    // Foreign Keys
    public int UserId { get; set; }
    public int? ShiftId { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public Shift? Shift { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
```

```csharp
// src/KasserPro.Domain/Entities/OrderItem.cs
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class OrderItem : BaseEntity
{
    // Product Snapshot (يُحفظ وقت الطلب)
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal? UnitCost { get; set; }

    // Quantity & Amounts
    public int Quantity { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }

    // Notes
    public string? Notes { get; set; }

    // Foreign Keys
    public int OrderId { get; set; }

    // Navigation
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
```

```csharp
// src/KasserPro.Domain/Entities/Payment.cs
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

public class Payment : BaseEntity
{
    public PaymentMethod Method { get; set; }
    public decimal Amount { get; set; }
    public string? Reference { get; set; }  // رقم العملية للبطاقة

    // Foreign Keys
    public int OrderId { get; set; }

    // Navigation
    public Order Order { get; set; } = null!;
}
```

```csharp
// src/KasserPro.Domain/Entities/Shift.cs
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class Shift : BaseEntity
{
    public decimal OpeningBalance { get; set; }  // رصيد الافتتاح
    public decimal ClosingBalance { get; set; }  // رصيد الإغلاق
    public decimal ExpectedBalance { get; set; } // الرصيد المتوقع
    public decimal Difference { get; set; }      // الفرق

    public DateTime OpenedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public bool IsClosed { get; set; } = false;

    public string? Notes { get; set; }

    // Totals (محسوبة)
    public decimal TotalCash { get; set; }
    public decimal TotalCard { get; set; }
    public int TotalOrders { get; set; }

    // Foreign Keys
    public int UserId { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
```

### 🟢 Application Layer (طبقة التطبيق)

```csharp
// src/KasserPro.Application/DTOs/Common/ApiResponse.cs
namespace KasserPro.Application.DTOs.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }

    public static ApiResponse<T> Ok(T data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> Fail(string message, List<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Errors = errors
        };
    }
}
```

```csharp
// src/KasserPro.Application/DTOs/Auth/LoginRequest.cs
namespace KasserPro.Application.DTOs.Auth;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
```

```csharp
// src/KasserPro.Application/DTOs/Auth/LoginResponse.cs
namespace KasserPro.Application.DTOs.Auth;

public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserInfo User { get; set; } = null!;
}

public class UserInfo
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
```

```csharp
// src/KasserPro.Application/Common/Interfaces/IRepository.cs
namespace KasserPro.Application.Common.Interfaces;

using System.Linq.Expressions;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    Task<T> AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null);
}
```

```csharp
// src/KasserPro.Application/Common/Interfaces/IUnitOfWork.cs
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
```

```csharp
// src/KasserPro.Application/Services/Interfaces/IAuthService.cs
namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Auth;
using KasserPro.Application.DTOs.Common;

public interface IAuthService
{
    Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request);
    Task<ApiResponse<bool>> RegisterAsync(RegisterRequest request);
    Task<ApiResponse<UserInfo>> GetCurrentUserAsync(int userId);
}
```

```csharp
// src/KasserPro.Application/Services/Interfaces/IProductService.cs
namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Products;

public interface IProductService
{
    Task<ApiResponse<List<ProductDto>>> GetAllAsync();
    Task<ApiResponse<ProductDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<ProductDto>>> GetByCategoryAsync(int categoryId);
    Task<ApiResponse<ProductDto>> CreateAsync(CreateProductRequest request);
    Task<ApiResponse<ProductDto>> UpdateAsync(int id, UpdateProductRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}
```

```csharp
// src/KasserPro.Application/Services/Interfaces/IOrderService.cs
namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Orders;

public interface IOrderService
{
    Task<ApiResponse<OrderDto>> CreateAsync(CreateOrderRequest request, int userId);
    Task<ApiResponse<OrderDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<OrderDto>>> GetTodayOrdersAsync();
    Task<ApiResponse<OrderDto>> AddItemAsync(int orderId, AddOrderItemRequest request);
    Task<ApiResponse<OrderDto>> RemoveItemAsync(int orderId, int itemId);
    Task<ApiResponse<OrderDto>> CompleteAsync(int orderId, CompleteOrderRequest request);
    Task<ApiResponse<bool>> CancelAsync(int orderId, string? reason);
}
```

### 🟡 Infrastructure Layer (طبقة البنية التحتية)

```csharp
// src/KasserPro.Infrastructure/Data/AppDbContext.cs
namespace KasserPro.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;
using KasserPro.Domain.Entities;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Shift> Shifts => Set<Shift>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Global Query Filter for Soft Delete
        modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Category>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Product>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Order>().HasQueryFilter(e => !e.IsDeleted);
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
```

```csharp
// src/KasserPro.Infrastructure/Repositories/GenericRepository.cs
namespace KasserPro.Infrastructure.Repositories;

using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using KasserPro.Application.Common.Interfaces;
using KasserPro.Infrastructure.Data;

public class GenericRepository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public GenericRepository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.Where(predicate).ToListAsync();
    }

    public async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        return entity;
    }

    public void Update(T entity)
    {
        _dbSet.Update(entity);
    }

    public void Delete(T entity)
    {
        _dbSet.Remove(entity);
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _dbSet.FindAsync(id) != null;
    }

    public async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null)
    {
        return predicate == null
            ? await _dbSet.CountAsync()
            : await _dbSet.CountAsync(predicate);
    }
}
```

### 🔴 API Layer (طبقة العرض)

```csharp
// src/KasserPro.API/Controllers/BaseController.cs
namespace KasserPro.API.Controllers;

using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseController : ControllerBase
{
    protected int GetUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return int.TryParse(userIdClaim, out int userId) ? userId : 0;
    }
}
```

```csharp
// src/KasserPro.API/Middleware/ExceptionMiddleware.cs
namespace KasserPro.API.Middleware;

using System.Net;
using System.Text.Json;
using KasserPro.Application.DTOs.Common;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = exception switch
        {
            KeyNotFoundException => new { StatusCode = (int)HttpStatusCode.NotFound, Message = exception.Message },
            UnauthorizedAccessException => new { StatusCode = (int)HttpStatusCode.Unauthorized, Message = "غير مصرح" },
            _ => new { StatusCode = (int)HttpStatusCode.InternalServerError, Message = "حدث خطأ داخلي" }
        };

        context.Response.StatusCode = response.StatusCode;

        var apiResponse = ApiResponse<object>.Fail(response.Message);
        await context.Response.WriteAsync(JsonSerializer.Serialize(apiResponse));
    }
}
```

---

## 💾 قاعدة البيانات (Database)

### Entity Configurations

```csharp
// src/KasserPro.Infrastructure/Data/Configurations/OrderConfiguration.cs
namespace KasserPro.Infrastructure.Data.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using KasserPro.Domain.Entities;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(o => o.OrderNumber).IsUnique();

        builder.Property(o => o.Subtotal).HasPrecision(18, 2);
        builder.Property(o => o.DiscountAmount).HasPrecision(18, 2);
        builder.Property(o => o.TaxAmount).HasPrecision(18, 2);
        builder.Property(o => o.Total).HasPrecision(18, 2);
        builder.Property(o => o.AmountPaid).HasPrecision(18, 2);
        builder.Property(o => o.ChangeAmount).HasPrecision(18, 2);

        builder.HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(o => o.Items)
            .WithOne(i => i.Order)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

### Seed Data (بيانات أولية)

```csharp
// src/KasserPro.Infrastructure/Data/DbInitializer.cs
namespace KasserPro.Infrastructure.Data;

using KasserPro.Domain.Entities;
using KasserPro.Domain.Enums;
using Microsoft.EntityFrameworkCore;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext context)
    {
        // Create database
        await context.Database.MigrateAsync();

        // Seed Admin user if not exists
        if (!await context.Users.AnyAsync())
        {
            var admin = new User
            {
                Name = "مدير النظام",
                Email = "admin@kasserpro.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = UserRole.Admin,
                IsActive = true
            };

            context.Users.Add(admin);
        }

        // Seed Categories
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new() { Name = "مشروبات", NameEn = "Beverages", SortOrder = 1 },
                new() { Name = "وجبات", NameEn = "Meals", SortOrder = 2 },
                new() { Name = "حلويات", NameEn = "Desserts", SortOrder = 3 }
            };

            context.Categories.AddRange(categories);
        }

        await context.SaveChangesAsync();
    }
}
```

---

## 🔌 APIs المطلوبة للـ MVP

### ملخص الـ Endpoints

| Method         | Endpoint                          | Description            | Auth  |
| -------------- | --------------------------------- | ---------------------- | ----- |
| **Auth**       |
| POST           | `/api/auth/login`                 | تسجيل الدخول           | ❌    |
| POST           | `/api/auth/register`              | تسجيل مستخدم جديد      | Admin |
| GET            | `/api/auth/me`                    | بيانات المستخدم الحالي | ✅    |
| **Categories** |
| GET            | `/api/categories`                 | قائمة التصنيفات        | ✅    |
| POST           | `/api/categories`                 | إضافة تصنيف            | Admin |
| PUT            | `/api/categories/{id}`            | تعديل تصنيف            | Admin |
| DELETE         | `/api/categories/{id}`            | حذف تصنيف              | Admin |
| **Products**   |
| GET            | `/api/products`                   | قائمة المنتجات         | ✅    |
| GET            | `/api/products/{id}`              | منتج واحد              | ✅    |
| POST           | `/api/products`                   | إضافة منتج             | Admin |
| PUT            | `/api/products/{id}`              | تعديل منتج             | Admin |
| DELETE         | `/api/products/{id}`              | حذف منتج               | Admin |
| **Orders**     |
| GET            | `/api/orders`                     | قائمة الطلبات          | ✅    |
| GET            | `/api/orders/{id}`                | تفاصيل طلب             | ✅    |
| POST           | `/api/orders`                     | إنشاء طلب جديد         | ✅    |
| POST           | `/api/orders/{id}/items`          | إضافة منتج للطلب       | ✅    |
| DELETE         | `/api/orders/{id}/items/{itemId}` | حذف منتج من الطلب      | ✅    |
| POST           | `/api/orders/{id}/complete`       | إكمال الطلب            | ✅    |
| POST           | `/api/orders/{id}/cancel`         | إلغاء الطلب            | ✅    |
| **Shifts**     |
| GET            | `/api/shifts/current`             | الوردية الحالية        | ✅    |
| POST           | `/api/shifts/open`                | فتح وردية              | ✅    |
| POST           | `/api/shifts/close`               | إغلاق وردية            | ✅    |
| **Reports**    |
| GET            | `/api/reports/daily`              | تقرير يومي             | Admin |
| GET            | `/api/reports/sales`              | تقرير مبيعات           | Admin |

---

## 🔐 Authentication & Authorization

### JWT Configuration

```csharp
// src/KasserPro.API/appsettings.json
{
  "Jwt": {
    "Key": "YourSuperSecretKeyHere_MustBe32Characters!",
    "Issuer": "KasserPro",
    "Audience": "KasserPro",
    "ExpiryInHours": 24
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=kasserpro.db"
  }
}
```

### JWT Service

```csharp
// src/KasserPro.Application/Services/Implementations/JwtService.cs
namespace KasserPro.Application.Services.Implementations;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using KasserPro.Domain.Entities;

public class JwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

        var claims = new List<Claim>
        {
            new("userId", user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(
                int.Parse(_config["Jwt:ExpiryInHours"]!)),
            signingCredentials: new SigningCredentials(
                key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

---

## ✅ أفضل الممارسات (Best Practices)

### 1. Naming Conventions

```csharp
// ✅ Good
public class ProductService { }
public interface IProductService { }
public async Task<Product> GetProductByIdAsync(int id)

// ❌ Bad
public class productservice { }
public interface ProductService { }
public async Task<Product> GetProduct(int id)
```

### 2. DTOs vs Entities

```csharp
// ✅ Good - استخدم DTOs للـ API
[HttpGet("{id}")]
public async Task<ActionResult<ProductDto>> Get(int id)

// ❌ Bad - لا تُرجع Entities مباشرة
[HttpGet("{id}")]
public async Task<ActionResult<Product>> Get(int id)
```

### 3. Async/Await

```csharp
// ✅ Good
public async Task<List<Product>> GetAllAsync()
{
    return await _dbSet.ToListAsync();
}

// ❌ Bad
public List<Product> GetAll()
{
    return _dbSet.ToList();
}
```

### 4. Dependency Injection

```csharp
// ✅ Good - Constructor Injection
public class ProductService
{
    private readonly IUnitOfWork _unitOfWork;

    public ProductService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
}

// ❌ Bad - Service Locator
public class ProductService
{
    public void DoSomething()
    {
        var unitOfWork = ServiceLocator.Get<IUnitOfWork>();
    }
}
```

### 5. Error Handling

```csharp
// ✅ Good - Specific exceptions
if (product == null)
    throw new NotFoundException($"Product with ID {id} not found");

// ❌ Bad - Generic exceptions
if (product == null)
    throw new Exception("Not found");
```

---

## 📝 خطوات التنفيذ (Step by Step)

### الأسبوع 1: إعداد المشروع

- [ ] إنشاء Solution وProjects
- [ ] إضافة الحزم المطلوبة
- [ ] إنشاء Entities
- [ ] إنشاء DbContext
- [ ] إنشاء أول Migration
- [ ] تشغيل المشروع

### الأسبوع 2: Authentication

- [ ] إنشاء AuthController
- [ ] إنشاء AuthService
- [ ] إنشاء JwtService
- [ ] اختبار Login API

### الأسبوع 3: Products & Categories

- [ ] إنشاء DTOs
- [ ] إنشاء Services
- [ ] إنشاء Controllers
- [ ] اختبار CRUD APIs

### الأسبوع 4: Orders

- [ ] إنشاء Order DTOs
- [ ] إنشاء OrderService
- [ ] إنشاء OrdersController
- [ ] اختبار Order flow

### الأسبوع 5: Shifts & Reports

- [ ] إنشاء Shift APIs
- [ ] إنشاء Reports APIs
- [ ] اختبار كامل

### الأسبوع 6: Testing & Documentation

- [ ] Unit Tests
- [ ] Integration Tests
- [ ] Swagger Documentation
- [ ] Final Review

---

## 🎯 الأوامر الأساسية

```powershell
# تشغيل المشروع
cd src/KasserPro.API
dotnet run

# إنشاء Migration
dotnet ef migrations add InitialCreate -p ../KasserPro.Infrastructure -s .

# تطبيق Migration
dotnet ef database update -p ../KasserPro.Infrastructure -s .

# مشاهدة Swagger
# افتح المتصفح على: https://localhost:5001/swagger
```

---

> 💡 **نصيحة:** ابدأ بسيطاً وأضف تدريجياً. لا تحاول بناء كل شيء دفعة واحدة!
