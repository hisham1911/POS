namespace KasserPro.Infrastructure.Data;

using KasserPro.Domain.Entities;
using KasserPro.Domain.Enums;
using Microsoft.EntityFrameworkCore;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        // Seed Default Tenant
        if (!await context.Tenants.AnyAsync())
        {
            var tenant = new Tenant
            {
                Name = "الشركة الافتراضية",
                NameEn = "Default Company",
                Slug = "default",
                Currency = "EGP",
                Timezone = "Africa/Cairo",
                IsActive = true
            };
            context.Tenants.Add(tenant);
            await context.SaveChangesAsync();
        }

        var defaultTenant = await context.Tenants.FirstAsync();

        // Seed Default Branch
        if (!await context.Branches.AnyAsync())
        {
            var branch = new Branch
            {
                TenantId = defaultTenant.Id,
                Name = "الفرع الرئيسي",
                Code = "BR001",
                Address = "شارع التحرير، القاهرة",
                Phone = "01000000001",
                DefaultTaxRate = 14, // Egypt VAT 14%
                DefaultTaxInclusive = true, // الضريبة مضمنة في السعر
                CurrencyCode = "EGP",
                IsActive = true
            };
            context.Branches.Add(branch);
            await context.SaveChangesAsync();

            // Add second branch for multi-branch testing
            var branch2 = new Branch
            {
                TenantId = defaultTenant.Id,
                Name = "فرع المعادي",
                Code = "BR002",
                Address = "شارع 9، المعادي، القاهرة",
                Phone = "01000000002",
                DefaultTaxRate = 14,
                DefaultTaxInclusive = true,
                CurrencyCode = "EGP",
                IsActive = true
            };
            context.Branches.Add(branch2);
            await context.SaveChangesAsync();
        }

        var defaultBranch = await context.Branches.FirstAsync();

        // Update existing Branch with tax defaults if missing
        if (defaultBranch.DefaultTaxRate == 0)
        {
            defaultBranch.DefaultTaxRate = 14;
            defaultBranch.DefaultTaxInclusive = true;
            defaultBranch.CurrencyCode = "EGP";
            await context.SaveChangesAsync();
        }

        // Update existing Products with TaxInclusive if missing
        var productsToUpdate = await context.Products.Where(p => !p.TaxInclusive).ToListAsync();
        if (productsToUpdate.Any())
        {
            foreach (var p in productsToUpdate)
                p.TaxInclusive = true;
            await context.SaveChangesAsync();
        }

        // Seed Users
        if (!await context.Users.AnyAsync())
        {
            var users = new List<User>
            {
                new()
                {
                    TenantId = defaultTenant.Id,
                    BranchId = defaultBranch.Id,
                    Name = "مدير النظام",
                    Email = "admin@kasserpro.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = UserRole.Admin,
                    IsActive = true
                },
                new()
                {
                    TenantId = defaultTenant.Id,
                    BranchId = defaultBranch.Id,
                    Name = "أحمد الكاشير",
                    Email = "ahmed@kasserpro.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Role = UserRole.Cashier,
                    IsActive = true
                },
                new()
                {
                    TenantId = defaultTenant.Id,
                    BranchId = defaultBranch.Id,
                    Name = "سارة المحاسبة",
                    Email = "sara@kasserpro.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Role = UserRole.Cashier,
                    IsActive = true
                }
            };
            context.Users.AddRange(users);
            await context.SaveChangesAsync();
        }

        // Seed Categories
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new() { TenantId = defaultTenant.Id, Name = "مشروبات ساخنة", NameEn = "Hot Drinks", SortOrder = 1, ImageUrl = "☕" },
                new() { TenantId = defaultTenant.Id, Name = "مشروبات باردة", NameEn = "Cold Drinks", SortOrder = 2, ImageUrl = "🥤" },
                new() { TenantId = defaultTenant.Id, Name = "وجبات رئيسية", NameEn = "Main Dishes", SortOrder = 3, ImageUrl = "🍽️" },
                new() { TenantId = defaultTenant.Id, Name = "سندويشات", NameEn = "Sandwiches", SortOrder = 4, ImageUrl = "🥪" },
                new() { TenantId = defaultTenant.Id, Name = "حلويات", NameEn = "Desserts", SortOrder = 5, ImageUrl = "🍰" },
                new() { TenantId = defaultTenant.Id, Name = "مقبلات", NameEn = "Appetizers", SortOrder = 6, ImageUrl = "🥗" }
            };
            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();
        }

        // Seed Products
        if (!await context.Products.AnyAsync())
        {
            var categories = await context.Categories.ToListAsync();
            
            var products = new List<Product>
            {
                // مشروبات ساخنة (الأسعار شاملة الضريبة 14%)
                new() { TenantId = defaultTenant.Id, Name = "قهوة عربية", NameEn = "Arabic Coffee", Sku = "HOT001", Price = 8, Cost = 2, TaxRate = 14, TaxInclusive = true, CategoryId = categories[0].Id, ImageUrl = "☕" },
                new() { TenantId = defaultTenant.Id, Name = "قهوة تركية", NameEn = "Turkish Coffee", Sku = "HOT002", Price = 10, Cost = 3, TaxRate = 14, TaxInclusive = true, CategoryId = categories[0].Id, ImageUrl = "☕" },
                new() { TenantId = defaultTenant.Id, Name = "كابتشينو", NameEn = "Cappuccino", Sku = "HOT003", Price = 15, Cost = 5, TaxRate = 14, TaxInclusive = true, CategoryId = categories[0].Id, ImageUrl = "☕" },
                new() { TenantId = defaultTenant.Id, Name = "لاتيه", NameEn = "Latte", Sku = "HOT004", Price = 16, Cost = 5, TaxRate = 14, TaxInclusive = true, CategoryId = categories[0].Id, ImageUrl = "☕" },
                new() { TenantId = defaultTenant.Id, Name = "شاي أحمر", NameEn = "Black Tea", Sku = "HOT005", Price = 5, Cost = 1, TaxRate = 14, TaxInclusive = true, CategoryId = categories[0].Id, ImageUrl = "🍵" },
                new() { TenantId = defaultTenant.Id, Name = "شاي أخضر", NameEn = "Green Tea", Sku = "HOT006", Price = 6, Cost = 1.5m, TaxRate = 14, TaxInclusive = true, CategoryId = categories[0].Id, ImageUrl = "🍵" },
                
                // مشروبات باردة
                new() { TenantId = defaultTenant.Id, Name = "عصير برتقال", NameEn = "Orange Juice", Sku = "CLD001", Price = 12, Cost = 4, TaxRate = 14, TaxInclusive = true, CategoryId = categories[1].Id, ImageUrl = "🍊" },
                new() { TenantId = defaultTenant.Id, Name = "عصير تفاح", NameEn = "Apple Juice", Sku = "CLD002", Price = 12, Cost = 4, TaxRate = 14, TaxInclusive = true, CategoryId = categories[1].Id, ImageUrl = "🍎" },
                new() { TenantId = defaultTenant.Id, Name = "عصير مانجو", NameEn = "Mango Juice", Sku = "CLD003", Price = 14, Cost = 5, TaxRate = 14, TaxInclusive = true, CategoryId = categories[1].Id, ImageUrl = "🥭" },
                new() { TenantId = defaultTenant.Id, Name = "موهيتو", NameEn = "Mojito", Sku = "CLD004", Price = 18, Cost = 6, TaxRate = 14, TaxInclusive = true, CategoryId = categories[1].Id, ImageUrl = "🍹" },
                new() { TenantId = defaultTenant.Id, Name = "آيس كوفي", NameEn = "Iced Coffee", Sku = "CLD005", Price = 16, Cost = 5, TaxRate = 14, TaxInclusive = true, CategoryId = categories[1].Id, ImageUrl = "🧊" },
                new() { TenantId = defaultTenant.Id, Name = "سموذي فراولة", NameEn = "Strawberry Smoothie", Sku = "CLD006", Price = 20, Cost = 7, TaxRate = 14, TaxInclusive = true, CategoryId = categories[1].Id, ImageUrl = "🍓" },
                
                // وجبات رئيسية
                new() { TenantId = defaultTenant.Id, Name = "برجر لحم", NameEn = "Beef Burger", Sku = "MN001", Price = 35, Cost = 15, TaxRate = 14, TaxInclusive = true, CategoryId = categories[2].Id, ImageUrl = "🍔" },
                new() { TenantId = defaultTenant.Id, Name = "برجر دجاج", NameEn = "Chicken Burger", Sku = "MN002", Price = 30, Cost = 12, TaxRate = 14, TaxInclusive = true, CategoryId = categories[2].Id, ImageUrl = "🍔" },
                new() { TenantId = defaultTenant.Id, Name = "ستيك", NameEn = "Steak", Sku = "MN003", Price = 75, Cost = 35, TaxRate = 14, TaxInclusive = true, CategoryId = categories[2].Id, ImageUrl = "🥩" },
                new() { TenantId = defaultTenant.Id, Name = "دجاج مشوي", NameEn = "Grilled Chicken", Sku = "MN004", Price = 45, Cost = 18, TaxRate = 14, TaxInclusive = true, CategoryId = categories[2].Id, ImageUrl = "🍗" },
                new() { TenantId = defaultTenant.Id, Name = "سمك مشوي", NameEn = "Grilled Fish", Sku = "MN005", Price = 55, Cost = 25, TaxRate = 14, TaxInclusive = true, CategoryId = categories[2].Id, ImageUrl = "🐟" },
                new() { TenantId = defaultTenant.Id, Name = "باستا", NameEn = "Pasta", Sku = "MN006", Price = 32, Cost = 10, TaxRate = 14, TaxInclusive = true, CategoryId = categories[2].Id, ImageUrl = "🍝" },
                
                // سندويشات
                new() { TenantId = defaultTenant.Id, Name = "شاورما لحم", NameEn = "Beef Shawarma", Sku = "SW001", Price = 18, Cost = 7, TaxRate = 14, TaxInclusive = true, CategoryId = categories[3].Id, ImageUrl = "🌯" },
                new() { TenantId = defaultTenant.Id, Name = "شاورما دجاج", NameEn = "Chicken Shawarma", Sku = "SW002", Price = 15, Cost = 6, TaxRate = 14, TaxInclusive = true, CategoryId = categories[3].Id, ImageUrl = "🌯" },
                new() { TenantId = defaultTenant.Id, Name = "فلافل", NameEn = "Falafel", Sku = "SW003", Price = 10, Cost = 3, TaxRate = 14, TaxInclusive = true, CategoryId = categories[3].Id, ImageUrl = "🧆" },
                new() { TenantId = defaultTenant.Id, Name = "كلوب ساندويش", NameEn = "Club Sandwich", Sku = "SW004", Price = 25, Cost = 10, TaxRate = 14, TaxInclusive = true, CategoryId = categories[3].Id, ImageUrl = "🥪" },
                
                // حلويات
                new() { TenantId = defaultTenant.Id, Name = "كيكة شوكولاتة", NameEn = "Chocolate Cake", Sku = "DS001", Price = 20, Cost = 8, TaxRate = 14, TaxInclusive = true, CategoryId = categories[4].Id, ImageUrl = "🍫" },
                new() { TenantId = defaultTenant.Id, Name = "تشيز كيك", NameEn = "Cheesecake", Sku = "DS002", Price = 22, Cost = 9, TaxRate = 14, TaxInclusive = true, CategoryId = categories[4].Id, ImageUrl = "🍰" },
                new() { TenantId = defaultTenant.Id, Name = "كنافة", NameEn = "Kunafa", Sku = "DS003", Price = 18, Cost = 7, TaxRate = 14, TaxInclusive = true, CategoryId = categories[4].Id, ImageUrl = "🍮" },
                new() { TenantId = defaultTenant.Id, Name = "آيس كريم", NameEn = "Ice Cream", Sku = "DS004", Price = 12, Cost = 4, TaxRate = 14, TaxInclusive = true, CategoryId = categories[4].Id, ImageUrl = "🍨" },
                
                // مقبلات
                new() { TenantId = defaultTenant.Id, Name = "حمص", NameEn = "Hummus", Sku = "AP001", Price = 12, Cost = 4, TaxRate = 14, TaxInclusive = true, CategoryId = categories[5].Id, ImageUrl = "🥣" },
                new() { TenantId = defaultTenant.Id, Name = "متبل", NameEn = "Mutabbal", Sku = "AP002", Price = 12, Cost = 4, TaxRate = 14, TaxInclusive = true, CategoryId = categories[5].Id, ImageUrl = "🥣" },
                new() { TenantId = defaultTenant.Id, Name = "سلطة خضراء", NameEn = "Green Salad", Sku = "AP003", Price = 15, Cost = 5, TaxRate = 14, TaxInclusive = true, CategoryId = categories[5].Id, ImageUrl = "🥗" },
                new() { TenantId = defaultTenant.Id, Name = "بطاطس مقلية", NameEn = "French Fries", Sku = "AP004", Price = 10, Cost = 3, TaxRate = 14, TaxInclusive = true, CategoryId = categories[5].Id, ImageUrl = "🍟" }
            };
            
            context.Products.AddRange(products);
            await context.SaveChangesAsync();
        }

        // Seed Sample Shift with Orders (for demo purposes)
        if (!await context.Shifts.AnyAsync())
        {
            var admin = await context.Users.FirstAsync(u => u.Role == UserRole.Admin);
            var products = await context.Products.Take(10).ToListAsync();
            var random = new Random(42); // Fixed seed for reproducible data

            // Create a closed shift from yesterday with orders
            var yesterdayShift = new Shift
            {
                TenantId = defaultTenant.Id,
                BranchId = defaultBranch.Id,
                UserId = admin.Id,
                OpeningBalance = 500,
                OpenedAt = DateTime.UtcNow.AddDays(-1).Date.AddHours(9), // Yesterday 9 AM
                IsClosed = true,
                ClosedAt = DateTime.UtcNow.AddDays(-1).Date.AddHours(21), // Yesterday 9 PM
                ClosingBalance = 1850,
                Notes = "وردية يوم أمس - مكتملة"
            };
            context.Shifts.Add(yesterdayShift);
            await context.SaveChangesAsync();

            // Create orders for yesterday's shift
            var yesterdayOrders = new List<Order>();
            for (int i = 0; i < 8; i++)
            {
                var orderTime = yesterdayShift.OpenedAt.AddHours(random.Next(1, 11));
                var order = CreateSampleOrder(
                    defaultTenant.Id, defaultBranch.Id, admin.Id, yesterdayShift.Id,
                    products, random, orderTime, i + 1, OrderStatus.Completed
                );
                yesterdayOrders.Add(order);
            }
            context.Orders.AddRange(yesterdayOrders);
            await context.SaveChangesAsync();

            // Update yesterday's shift totals
            var completedOrders = yesterdayOrders.Where(o => o.Status == OrderStatus.Completed).ToList();
            yesterdayShift.TotalOrders = completedOrders.Count;
            yesterdayShift.TotalCash = completedOrders
                .SelectMany(o => o.Payments)
                .Where(p => p.Method == PaymentMethod.Cash)
                .Sum(p => p.Amount);
            yesterdayShift.TotalCard = completedOrders
                .SelectMany(o => o.Payments)
                .Where(p => p.Method != PaymentMethod.Cash)
                .Sum(p => p.Amount);
            yesterdayShift.ExpectedBalance = yesterdayShift.OpeningBalance + yesterdayShift.TotalCash;
            yesterdayShift.Difference = yesterdayShift.ClosingBalance - yesterdayShift.ExpectedBalance;
            await context.SaveChangesAsync();

            // Create today's open shift
            var todayShift = new Shift
            {
                TenantId = defaultTenant.Id,
                BranchId = defaultBranch.Id,
                UserId = admin.Id,
                OpeningBalance = 500,
                OpenedAt = DateTime.UtcNow.Date.AddHours(9), // Today 9 AM
                IsClosed = false
            };
            context.Shifts.Add(todayShift);
            await context.SaveChangesAsync();

            // Create some orders for today's shift
            var todayOrders = new List<Order>();
            for (int i = 0; i < 5; i++)
            {
                var status = i < 3 ? OrderStatus.Completed : (i == 3 ? OrderStatus.Draft : OrderStatus.Pending);
                var orderTime = todayShift.OpenedAt.AddHours(random.Next(1, 6));
                var order = CreateSampleOrder(
                    defaultTenant.Id, defaultBranch.Id, admin.Id, todayShift.Id,
                    products, random, orderTime, i + 10, status
                );
                todayOrders.Add(order);
            }
            context.Orders.AddRange(todayOrders);
            await context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Create a sample order with proper snapshots and tax calculations
    /// </summary>
    private static Order CreateSampleOrder(
        int tenantId, int branchId, int userId, int shiftId,
        List<Product> products, Random random, DateTime orderTime, int orderNum, OrderStatus status)
    {
        var order = new Order
        {
            TenantId = tenantId,
            BranchId = branchId,
            ShiftId = shiftId,
            OrderNumber = $"ORD-{orderTime:yyyyMMdd}-{orderNum:D4}",
            UserId = userId,
            Status = status,
            OrderType = random.Next(3) switch { 0 => OrderType.DineIn, 1 => OrderType.Takeaway, _ => OrderType.Delivery },
            CreatedAt = orderTime,
            CustomerName = random.Next(3) == 0 ? "عميل VIP" : null,
            // Branch Snapshot
            BranchName = "الفرع الرئيسي",
            BranchAddress = "شارع التحرير، القاهرة",
            BranchPhone = "01000000001",
            // User Snapshot
            UserName = "مدير النظام",
            // Currency
            CurrencyCode = "EGP",
            TaxRate = 14
        };

        var itemCount = random.Next(2, 5);
        decimal subtotal = 0;
        decimal taxAmount = 0;

        for (int j = 0; j < itemCount; j++)
        {
            var product = products[random.Next(products.Count)];
            var qty = random.Next(1, 4);
            
            // Calculate tax for inclusive pricing
            // Price includes tax, so: netPrice = price / 1.14, taxAmount = price - netPrice
            var grossPrice = product.Price * qty;
            var netPrice = grossPrice / 1.14m;
            var itemTax = grossPrice - netPrice;

            var orderItem = new OrderItem
            {
                ProductId = product.Id,
                // Product Snapshot
                ProductName = product.Name,
                ProductNameEn = product.NameEn,
                ProductSku = product.Sku,
                // Price Snapshot
                UnitPrice = product.Price,
                UnitCost = product.Cost,
                OriginalPrice = product.Price,
                Quantity = qty,
                // Tax Snapshot
                TaxRate = 14,
                TaxInclusive = true,
                TaxAmount = Math.Round(itemTax, 2),
                // Totals
                Subtotal = grossPrice,
                Total = grossPrice // Tax inclusive, so total = gross
            };

            order.Items.Add(orderItem);
            subtotal += grossPrice;
            taxAmount += itemTax;
        }

        order.Subtotal = subtotal;
        order.TaxAmount = Math.Round(taxAmount, 2);
        order.Total = subtotal; // Tax inclusive

        if (status == OrderStatus.Completed)
        {
            order.AmountPaid = order.Total;
            order.AmountDue = 0;
            order.CompletedAt = orderTime.AddMinutes(random.Next(5, 20));
            
            // Add payment
            var paymentMethod = random.Next(3) switch
            {
                0 => PaymentMethod.Cash,
                1 => PaymentMethod.Card,
                _ => PaymentMethod.Fawry
            };
            
            order.Payments.Add(new Payment
            {
                TenantId = tenantId,
                BranchId = branchId,
                Method = paymentMethod,
                Amount = order.Total,
                CreatedAt = order.CompletedAt.Value
            });
        }
        else if (status == OrderStatus.Cancelled)
        {
            order.CancelledAt = orderTime.AddMinutes(random.Next(10, 30));
            order.CancellationReason = "طلب العميل الإلغاء";
        }

        return order;
    }
}
