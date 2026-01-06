namespace KasserPro.Infrastructure.Data;

using KasserPro.Domain.Entities;
using KasserPro.Domain.Enums;
using Microsoft.EntityFrameworkCore;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        // Seed Admin user
        if (!await context.Users.AnyAsync())
        {
            var users = new List<User>
            {
                new()
                {
                    Name = "مدير النظام",
                    Email = "admin@kasserpro.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = UserRole.Admin,
                    IsActive = true
                },
                new()
                {
                    Name = "أحمد الكاشير",
                    Email = "ahmed@kasserpro.com",
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
                new() { Name = "مشروبات ساخنة", NameEn = "Hot Drinks", SortOrder = 1, ImageUrl = "☕" },
                new() { Name = "مشروبات باردة", NameEn = "Cold Drinks", SortOrder = 2, ImageUrl = "🥤" },
                new() { Name = "وجبات رئيسية", NameEn = "Main Dishes", SortOrder = 3, ImageUrl = "🍽️" },
                new() { Name = "سندويشات", NameEn = "Sandwiches", SortOrder = 4, ImageUrl = "🥪" },
                new() { Name = "حلويات", NameEn = "Desserts", SortOrder = 5, ImageUrl = "🍰" },
                new() { Name = "مقبلات", NameEn = "Appetizers", SortOrder = 6, ImageUrl = "🥗" }
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
                // مشروبات ساخنة
                new() { Name = "قهوة عربية", NameEn = "Arabic Coffee", Price = 8, Cost = 2, CategoryId = categories[0].Id, ImageUrl = "☕" },
                new() { Name = "قهوة تركية", NameEn = "Turkish Coffee", Price = 10, Cost = 3, CategoryId = categories[0].Id, ImageUrl = "☕" },
                new() { Name = "كابتشينو", NameEn = "Cappuccino", Price = 15, Cost = 5, CategoryId = categories[0].Id, ImageUrl = "☕" },
                new() { Name = "لاتيه", NameEn = "Latte", Price = 16, Cost = 5, CategoryId = categories[0].Id, ImageUrl = "☕" },
                new() { Name = "شاي أحمر", NameEn = "Black Tea", Price = 5, Cost = 1, CategoryId = categories[0].Id, ImageUrl = "🍵" },
                new() { Name = "شاي أخضر", NameEn = "Green Tea", Price = 6, Cost = 1.5m, CategoryId = categories[0].Id, ImageUrl = "🍵" },
                
                // مشروبات باردة
                new() { Name = "عصير برتقال", NameEn = "Orange Juice", Price = 12, Cost = 4, CategoryId = categories[1].Id, ImageUrl = "🍊" },
                new() { Name = "عصير تفاح", NameEn = "Apple Juice", Price = 12, Cost = 4, CategoryId = categories[1].Id, ImageUrl = "🍎" },
                new() { Name = "عصير مانجو", NameEn = "Mango Juice", Price = 14, Cost = 5, CategoryId = categories[1].Id, ImageUrl = "🥭" },
                new() { Name = "موهيتو", NameEn = "Mojito", Price = 18, Cost = 6, CategoryId = categories[1].Id, ImageUrl = "🍹" },
                new() { Name = "آيس كوفي", NameEn = "Iced Coffee", Price = 16, Cost = 5, CategoryId = categories[1].Id, ImageUrl = "🧊" },
                new() { Name = "سموذي فراولة", NameEn = "Strawberry Smoothie", Price = 20, Cost = 7, CategoryId = categories[1].Id, ImageUrl = "🍓" },
                
                // وجبات رئيسية
                new() { Name = "برجر لحم", NameEn = "Beef Burger", Price = 35, Cost = 15, CategoryId = categories[2].Id, ImageUrl = "🍔" },
                new() { Name = "برجر دجاج", NameEn = "Chicken Burger", Price = 30, Cost = 12, CategoryId = categories[2].Id, ImageUrl = "🍔" },
                new() { Name = "ستيك", NameEn = "Steak", Price = 75, Cost = 35, CategoryId = categories[2].Id, ImageUrl = "🥩" },
                new() { Name = "دجاج مشوي", NameEn = "Grilled Chicken", Price = 45, Cost = 18, CategoryId = categories[2].Id, ImageUrl = "🍗" },
                new() { Name = "سمك مشوي", NameEn = "Grilled Fish", Price = 55, Cost = 25, CategoryId = categories[2].Id, ImageUrl = "🐟" },
                new() { Name = "باستا", NameEn = "Pasta", Price = 32, Cost = 10, CategoryId = categories[2].Id, ImageUrl = "🍝" },
                
                // سندويشات
                new() { Name = "شاورما لحم", NameEn = "Beef Shawarma", Price = 18, Cost = 7, CategoryId = categories[3].Id, ImageUrl = "🌯" },
                new() { Name = "شاورما دجاج", NameEn = "Chicken Shawarma", Price = 15, Cost = 6, CategoryId = categories[3].Id, ImageUrl = "🌯" },
                new() { Name = "فلافل", NameEn = "Falafel", Price = 10, Cost = 3, CategoryId = categories[3].Id, ImageUrl = "🧆" },
                new() { Name = "كلوب ساندويش", NameEn = "Club Sandwich", Price = 25, Cost = 10, CategoryId = categories[3].Id, ImageUrl = "🥪" },
                
                // حلويات
                new() { Name = "كيكة شوكولاتة", NameEn = "Chocolate Cake", Price = 20, Cost = 8, CategoryId = categories[4].Id, ImageUrl = "🍫" },
                new() { Name = "تشيز كيك", NameEn = "Cheesecake", Price = 22, Cost = 9, CategoryId = categories[4].Id, ImageUrl = "🍰" },
                new() { Name = "كنافة", NameEn = "Kunafa", Price = 18, Cost = 7, CategoryId = categories[4].Id, ImageUrl = "🍮" },
                new() { Name = "آيس كريم", NameEn = "Ice Cream", Price = 12, Cost = 4, CategoryId = categories[4].Id, ImageUrl = "🍨" },
                
                // مقبلات
                new() { Name = "حمص", NameEn = "Hummus", Price = 12, Cost = 4, CategoryId = categories[5].Id, ImageUrl = "🥣" },
                new() { Name = "متبل", NameEn = "Mutabbal", Price = 12, Cost = 4, CategoryId = categories[5].Id, ImageUrl = "🥣" },
                new() { Name = "سلطة خضراء", NameEn = "Green Salad", Price = 15, Cost = 5, CategoryId = categories[5].Id, ImageUrl = "🥗" },
                new() { Name = "بطاطس مقلية", NameEn = "French Fries", Price = 10, Cost = 3, CategoryId = categories[5].Id, ImageUrl = "🍟" }
            };
            
            context.Products.AddRange(products);
            await context.SaveChangesAsync();
        }

        // Seed Sample Orders (للتجربة)
        if (!await context.Orders.AnyAsync())
        {
            var admin = await context.Users.FirstAsync(u => u.Role == UserRole.Admin);
            var products = await context.Products.Take(5).ToListAsync();

            var orders = new List<Order>();
            var random = new Random();

            // إنشاء 10 طلبات تجريبية
            for (int i = 0; i < 10; i++)
            {
                var order = new Order
                {
                    OrderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{(i + 1):D4}",
                    UserId = admin.Id,
                    Status = i < 8 ? OrderStatus.Completed : (i == 8 ? OrderStatus.Draft : OrderStatus.Cancelled),
                    CreatedAt = DateTime.UtcNow.AddHours(-random.Next(1, 48)),
                    CustomerName = i % 3 == 0 ? "عميل VIP" : null
                };

                // إضافة 2-4 منتجات لكل طلب
                var itemCount = random.Next(2, 5);
                decimal subtotal = 0;

                for (int j = 0; j < itemCount; j++)
                {
                    var product = products[random.Next(products.Count)];
                    var qty = random.Next(1, 4);
                    var itemTotal = product.Price * qty;
                    subtotal += itemTotal;

                    order.Items.Add(new OrderItem
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        UnitPrice = product.Price,
                        UnitCost = product.Cost,
                        Quantity = qty,
                        Total = itemTotal
                    });
                }

                order.Subtotal = subtotal;
                order.TaxAmount = subtotal * 0.15m;
                order.Total = subtotal + order.TaxAmount;

                if (order.Status == OrderStatus.Completed)
                {
                    order.AmountPaid = order.Total;
                    order.CompletedAt = order.CreatedAt.AddMinutes(random.Next(5, 30));
                    
                    order.Payments.Add(new Payment
                    {
                        Method = random.Next(2) == 0 ? PaymentMethod.Cash : PaymentMethod.Card,
                        Amount = order.Total
                    });
                }

                orders.Add(order);
            }

            context.Orders.AddRange(orders);
            await context.SaveChangesAsync();
        }
    }
}
