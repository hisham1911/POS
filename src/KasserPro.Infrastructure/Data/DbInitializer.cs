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
                Name = "شركة كاشير برو",
                NameEn = "KasserPro Company",
                Slug = "kasserpro",
                Currency = "EGP",
                Timezone = "Africa/Cairo",
                IsActive = true,
                AllowNegativeStock = false // منع البيع السالب
            };
            context.Tenants.Add(tenant);
            await context.SaveChangesAsync();
        }

        var defaultTenant = await context.Tenants.FirstAsync();

        // Seed Branches
        if (!await context.Branches.AnyAsync())
        {
            var branches = new List<Branch>
            {
                new()
                {
                    TenantId = defaultTenant.Id,
                    Name = "الفرع الرئيسي",
                    Code = "BR001",
                    Address = "شارع التحرير، وسط البلد، القاهرة",
                    Phone = "01000000001",
                    DefaultTaxRate = 14,
                    DefaultTaxInclusive = true,
                    CurrencyCode = "EGP",
                    IsActive = true
                },
                new()
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
                }
            };
            context.Branches.AddRange(branches);
            await context.SaveChangesAsync();
        }

        var defaultBranch = await context.Branches.FirstAsync();

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
                new() { TenantId = defaultTenant.Id, Name = "إلكترونيات", NameEn = "Electronics", SortOrder = 1, ImageUrl = "📱" },
                new() { TenantId = defaultTenant.Id, Name = "ملابس", NameEn = "Clothing", SortOrder = 2, ImageUrl = "👕" },
                new() { TenantId = defaultTenant.Id, Name = "أحذية", NameEn = "Shoes", SortOrder = 3, ImageUrl = "👟" },
                new() { TenantId = defaultTenant.Id, Name = "إكسسوارات", NameEn = "Accessories", SortOrder = 4, ImageUrl = "⌚" },
                new() { TenantId = defaultTenant.Id, Name = "منزل وحديقة", NameEn = "Home & Garden", SortOrder = 5, ImageUrl = "🏠" },
                new() { TenantId = defaultTenant.Id, Name = "أدوات مكتبية", NameEn = "Office Supplies", SortOrder = 6, ImageUrl = "📎" }
            };
            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();
        }

        // Seed Products with Stock
        if (!await context.Products.AnyAsync())
        {
            var categories = await context.Categories.ToListAsync();
            
            var products = new List<Product>
            {
                // إلكترونيات
                new() { TenantId = defaultTenant.Id, Name = "سماعات بلوتوث", NameEn = "Bluetooth Headphones", Sku = "ELEC001", Barcode = "6291041500213", Price = 350, Cost = 200, TaxRate = 14, TaxInclusive = true, CategoryId = categories[0].Id, ImageUrl = "🎧", TrackInventory = true, StockQuantity = 25, LowStockThreshold = 5 },
                new() { TenantId = defaultTenant.Id, Name = "شاحن سريع", NameEn = "Fast Charger", Sku = "ELEC002", Barcode = "6291041500220", Price = 120, Cost = 60, TaxRate = 14, TaxInclusive = true, CategoryId = categories[0].Id, ImageUrl = "🔌", TrackInventory = true, StockQuantity = 50, LowStockThreshold = 10 },
                new() { TenantId = defaultTenant.Id, Name = "باور بانك 10000", NameEn = "Power Bank 10000mAh", Sku = "ELEC003", Barcode = "6291041500237", Price = 280, Cost = 150, TaxRate = 14, TaxInclusive = true, CategoryId = categories[0].Id, ImageUrl = "🔋", TrackInventory = true, StockQuantity = 30, LowStockThreshold = 5 },
                new() { TenantId = defaultTenant.Id, Name = "ماوس لاسلكي", NameEn = "Wireless Mouse", Sku = "ELEC004", Barcode = "6291041500244", Price = 95, Cost = 45, TaxRate = 14, TaxInclusive = true, CategoryId = categories[0].Id, ImageUrl = "🖱️", TrackInventory = true, StockQuantity = 40, LowStockThreshold = 8 },
                new() { TenantId = defaultTenant.Id, Name = "كابل USB-C", NameEn = "USB-C Cable", Sku = "ELEC005", Barcode = "6291041500251", Price = 45, Cost = 15, TaxRate = 14, TaxInclusive = true, CategoryId = categories[0].Id, ImageUrl = "🔗", TrackInventory = true, StockQuantity = 100, LowStockThreshold = 20 },
                new() { TenantId = defaultTenant.Id, Name = "ساعة ذكية", NameEn = "Smart Watch", Sku = "ELEC006", Barcode = "6291041500268", Price = 850, Cost = 500, TaxRate = 14, TaxInclusive = true, CategoryId = categories[0].Id, ImageUrl = "⌚", TrackInventory = true, StockQuantity = 15, LowStockThreshold = 3 },
                
                // ملابس
                new() { TenantId = defaultTenant.Id, Name = "تيشيرت قطن", NameEn = "Cotton T-Shirt", Sku = "CLO001", Barcode = "6291041500275", Price = 150, Cost = 60, TaxRate = 14, TaxInclusive = true, CategoryId = categories[1].Id, ImageUrl = "👕", TrackInventory = true, StockQuantity = 80, LowStockThreshold = 15 },
                new() { TenantId = defaultTenant.Id, Name = "بنطلون جينز", NameEn = "Jeans Pants", Sku = "CLO002", Barcode = "6291041500282", Price = 320, Cost = 150, TaxRate = 14, TaxInclusive = true, CategoryId = categories[1].Id, ImageUrl = "👖", TrackInventory = true, StockQuantity = 45, LowStockThreshold = 10 },
                new() { TenantId = defaultTenant.Id, Name = "قميص رسمي", NameEn = "Formal Shirt", Sku = "CLO003", Barcode = "6291041500299", Price = 250, Cost = 100, TaxRate = 14, TaxInclusive = true, CategoryId = categories[1].Id, ImageUrl = "👔", TrackInventory = true, StockQuantity = 35, LowStockThreshold = 8 },
                new() { TenantId = defaultTenant.Id, Name = "جاكيت شتوي", NameEn = "Winter Jacket", Sku = "CLO004", Barcode = "6291041500306", Price = 550, Cost = 280, TaxRate = 14, TaxInclusive = true, CategoryId = categories[1].Id, ImageUrl = "🧥", TrackInventory = true, StockQuantity = 20, LowStockThreshold = 5 },
                
                // أحذية
                new() { TenantId = defaultTenant.Id, Name = "حذاء رياضي", NameEn = "Sports Shoes", Sku = "SHO001", Barcode = "6291041500313", Price = 450, Cost = 220, TaxRate = 14, TaxInclusive = true, CategoryId = categories[2].Id, ImageUrl = "👟", TrackInventory = true, StockQuantity = 30, LowStockThreshold = 6 },
                new() { TenantId = defaultTenant.Id, Name = "حذاء رسمي", NameEn = "Formal Shoes", Sku = "SHO002", Barcode = "6291041500320", Price = 380, Cost = 180, TaxRate = 14, TaxInclusive = true, CategoryId = categories[2].Id, ImageUrl = "👞", TrackInventory = true, StockQuantity = 25, LowStockThreshold = 5 },
                new() { TenantId = defaultTenant.Id, Name = "صندل", NameEn = "Sandals", Sku = "SHO003", Barcode = "6291041500337", Price = 180, Cost = 70, TaxRate = 14, TaxInclusive = true, CategoryId = categories[2].Id, ImageUrl = "🩴", TrackInventory = true, StockQuantity = 40, LowStockThreshold = 8 },
                
                // إكسسوارات
                new() { TenantId = defaultTenant.Id, Name = "حزام جلد", NameEn = "Leather Belt", Sku = "ACC001", Barcode = "6291041500344", Price = 120, Cost = 45, TaxRate = 14, TaxInclusive = true, CategoryId = categories[3].Id, ImageUrl = "🎀", TrackInventory = true, StockQuantity = 60, LowStockThreshold = 12 },
                new() { TenantId = defaultTenant.Id, Name = "محفظة", NameEn = "Wallet", Sku = "ACC002", Barcode = "6291041500351", Price = 180, Cost = 70, TaxRate = 14, TaxInclusive = true, CategoryId = categories[3].Id, ImageUrl = "👛", TrackInventory = true, StockQuantity = 45, LowStockThreshold = 10 },
                new() { TenantId = defaultTenant.Id, Name = "نظارة شمسية", NameEn = "Sunglasses", Sku = "ACC003", Barcode = "6291041500368", Price = 220, Cost = 90, TaxRate = 14, TaxInclusive = true, CategoryId = categories[3].Id, ImageUrl = "🕶️", TrackInventory = true, StockQuantity = 35, LowStockThreshold = 7 },
                new() { TenantId = defaultTenant.Id, Name = "شنطة ظهر", NameEn = "Backpack", Sku = "ACC004", Barcode = "6291041500375", Price = 350, Cost = 150, TaxRate = 14, TaxInclusive = true, CategoryId = categories[3].Id, ImageUrl = "🎒", TrackInventory = true, StockQuantity = 25, LowStockThreshold = 5 },
                
                // منزل وحديقة
                new() { TenantId = defaultTenant.Id, Name = "مصباح LED", NameEn = "LED Lamp", Sku = "HOM001", Barcode = "6291041500382", Price = 85, Cost = 35, TaxRate = 14, TaxInclusive = true, CategoryId = categories[4].Id, ImageUrl = "💡", TrackInventory = true, StockQuantity = 70, LowStockThreshold = 15 },
                new() { TenantId = defaultTenant.Id, Name = "ساعة حائط", NameEn = "Wall Clock", Sku = "HOM002", Barcode = "6291041500399", Price = 150, Cost = 60, TaxRate = 14, TaxInclusive = true, CategoryId = categories[4].Id, ImageUrl = "🕐", TrackInventory = true, StockQuantity = 30, LowStockThreshold = 6 },
                new() { TenantId = defaultTenant.Id, Name = "مرآة", NameEn = "Mirror", Sku = "HOM003", Barcode = "6291041500406", Price = 200, Cost = 80, TaxRate = 14, TaxInclusive = true, CategoryId = categories[4].Id, ImageUrl = "🪞", TrackInventory = true, StockQuantity = 20, LowStockThreshold = 4 },
                
                // أدوات مكتبية
                new() { TenantId = defaultTenant.Id, Name = "دفتر ملاحظات", NameEn = "Notebook", Sku = "OFF001", Barcode = "6291041500413", Price = 25, Cost = 8, TaxRate = 14, TaxInclusive = true, CategoryId = categories[5].Id, ImageUrl = "📓", TrackInventory = true, StockQuantity = 150, LowStockThreshold = 30 },
                new() { TenantId = defaultTenant.Id, Name = "أقلام (علبة)", NameEn = "Pens Box", Sku = "OFF002", Barcode = "6291041500420", Price = 35, Cost = 12, TaxRate = 14, TaxInclusive = true, CategoryId = categories[5].Id, ImageUrl = "🖊️", TrackInventory = true, StockQuantity = 100, LowStockThreshold = 20 },
                new() { TenantId = defaultTenant.Id, Name = "مقلمة", NameEn = "Pencil Case", Sku = "OFF003", Barcode = "6291041500437", Price = 45, Cost = 18, TaxRate = 14, TaxInclusive = true, CategoryId = categories[5].Id, ImageUrl = "✏️", TrackInventory = true, StockQuantity = 80, LowStockThreshold = 15 },
                new() { TenantId = defaultTenant.Id, Name = "مسطرة معدنية", NameEn = "Metal Ruler", Sku = "OFF004", Barcode = "6291041500444", Price = 15, Cost = 5, TaxRate = 14, TaxInclusive = true, CategoryId = categories[5].Id, ImageUrl = "📏", TrackInventory = true, StockQuantity = 120, LowStockThreshold = 25 }
            };
            
            // Set LastStockUpdate for all products
            foreach (var p in products)
            {
                p.LastStockUpdate = DateTime.UtcNow;
            }
            
            context.Products.AddRange(products);
            await context.SaveChangesAsync();
        }

        // Seed Customers
        if (!await context.Customers.AnyAsync())
        {
            var customers = new List<Customer>
            {
                new() { TenantId = defaultTenant.Id, Name = "محمد أحمد علي", Phone = "01001234567", Email = "mohamed@email.com", Address = "شارع المعز، القاهرة", LoyaltyPoints = 150, TotalOrders = 12, TotalSpent = 2500, LastOrderAt = DateTime.UtcNow.AddDays(-2), IsActive = true },
                new() { TenantId = defaultTenant.Id, Name = "فاطمة حسن", Phone = "01112345678", Email = "fatma@email.com", Address = "المهندسين، الجيزة", LoyaltyPoints = 280, TotalOrders = 25, TotalSpent = 4800, LastOrderAt = DateTime.UtcNow.AddDays(-1), IsActive = true },
                new() { TenantId = defaultTenant.Id, Name = "أحمد محمود", Phone = "01223456789", Email = "ahmed.m@email.com", Address = "مدينة نصر، القاهرة", LoyaltyPoints = 75, TotalOrders = 5, TotalSpent = 980, LastOrderAt = DateTime.UtcNow.AddDays(-5), IsActive = true },
                new() { TenantId = defaultTenant.Id, Name = "سارة عبدالله", Phone = "01098765432", Email = "sara.a@email.com", Address = "الدقي، الجيزة", LoyaltyPoints = 420, TotalOrders = 35, TotalSpent = 7200, LastOrderAt = DateTime.UtcNow.AddDays(-3), IsActive = true },
                new() { TenantId = defaultTenant.Id, Name = "علي حسين", Phone = "01198765432", Email = null, Address = "حلوان، القاهرة", LoyaltyPoints = 50, TotalOrders = 3, TotalSpent = 650, LastOrderAt = DateTime.UtcNow.AddDays(-10), IsActive = true },
                new() { TenantId = defaultTenant.Id, Name = "نور الدين", Phone = "01287654321", Email = "nour@email.com", Address = null, LoyaltyPoints = 180, TotalOrders = 15, TotalSpent = 3100, LastOrderAt = DateTime.UtcNow.AddDays(-4), IsActive = true },
                new() { TenantId = defaultTenant.Id, Name = "ياسمين خالد", Phone = "01087654321", Email = "yasmine@email.com", Address = "الزمالك، القاهرة", LoyaltyPoints = 320, TotalOrders = 28, TotalSpent = 5500, LastOrderAt = DateTime.UtcNow.AddDays(-1), IsActive = true },
                new() { TenantId = defaultTenant.Id, Name = "كريم سعيد", Phone = "01187654321", Email = null, Address = "العباسية", LoyaltyPoints = 90, TotalOrders = 8, TotalSpent = 1200, LastOrderAt = DateTime.UtcNow.AddDays(-7), IsActive = true }
            };
            context.Customers.AddRange(customers);
            await context.SaveChangesAsync();
        }

        // Seed Suppliers
        if (!await context.Suppliers.AnyAsync())
        {
            var suppliers = new List<Supplier>
            {
                new() { TenantId = defaultTenant.Id, BranchId = defaultBranch.Id, Name = "شركة الإلكترونيات المتقدمة", Phone = "0233334444", Email = "info@electronics-co.com", Address = "شارع الجمهورية، القاهرة", ContactPerson = "أحمد محمود", TaxNumber = "123-456-789", Notes = "مورد رئيسي للإلكترونيات", IsActive = true },
                new() { TenantId = defaultTenant.Id, BranchId = defaultBranch.Id, Name = "مؤسسة الملابس الحديثة", Phone = "0244445555", Email = "sales@modern-clothes.com", Address = "المنطقة الصناعية، العاشر من رمضان", ContactPerson = "سارة علي", TaxNumber = "234-567-890", Notes = "متخصصون في الملابس والأقمشة", IsActive = true },
                new() { TenantId = defaultTenant.Id, BranchId = defaultBranch.Id, Name = "شركة الأحذية الذهبية", Phone = "0255556666", Email = "contact@golden-shoes.com", Address = "مدينة بدر، القاهرة", ContactPerson = "محمد حسن", TaxNumber = "345-678-901", Notes = "أحذية بجودة عالية", IsActive = true },
                new() { TenantId = defaultTenant.Id, BranchId = defaultBranch.Id, Name = "مكتبة الأدوات المكتبية", Phone = "0266667777", Email = "orders@office-supplies.com", Address = "وسط البلد، القاهرة", ContactPerson = "فاطمة أحمد", TaxNumber = "456-789-012", Notes = "أدوات مكتبية ومستلزمات", IsActive = true },
                new() { TenantId = defaultTenant.Id, BranchId = defaultBranch.Id, Name = "شركة المنزل والديكور", Phone = "0277778888", Email = "info@home-decor.com", Address = "مدينة نصر، القاهرة", ContactPerson = "خالد سعيد", TaxNumber = "567-890-123", Notes = "ديكورات منزلية ومستلزمات", IsActive = true }
            };
            context.Suppliers.AddRange(suppliers);
            await context.SaveChangesAsync();
        }

        // Seed Shifts and Orders with varied dates
        if (!await context.Shifts.AnyAsync())
        {
            var admin = await context.Users.FirstAsync(u => u.Role == UserRole.Admin);
            var products = await context.Products.ToListAsync();
            var customers = await context.Customers.ToListAsync();
            var random = new Random(42);

            // Create shifts for the past 14 days
            for (int day = 14; day >= 0; day--)
            {
                var shiftDate = DateTime.UtcNow.Date.AddDays(-day);
                var isClosed = day > 0; // Only today's shift is open

                var shift = new Shift
                {
                    TenantId = defaultTenant.Id,
                    BranchId = defaultBranch.Id,
                    UserId = admin.Id,
                    OpeningBalance = 500,
                    OpenedAt = shiftDate.AddHours(9),
                    IsClosed = isClosed
                };

                if (isClosed)
                {
                    shift.ClosedAt = shiftDate.AddHours(21);
                    shift.Notes = $"وردية يوم {shiftDate:yyyy-MM-dd}";
                }

                context.Shifts.Add(shift);
                await context.SaveChangesAsync();

                // Create orders for this shift (more orders on weekends)
                var isWeekend = shiftDate.DayOfWeek == DayOfWeek.Friday || shiftDate.DayOfWeek == DayOfWeek.Saturday;
                var orderCount = day == 0 ? random.Next(3, 6) : (isWeekend ? random.Next(10, 18) : random.Next(5, 12));

                var orders = new List<Order>();
                decimal totalCash = 0;
                decimal totalCard = 0;

                for (int i = 0; i < orderCount; i++)
                {
                    var orderTime = shift.OpenedAt.AddMinutes(random.Next(30, 700));
                    var status = day == 0 && i >= orderCount - 2 
                        ? (i == orderCount - 1 ? OrderStatus.Draft : OrderStatus.Pending)
                        : OrderStatus.Completed;

                    // Assign customer to some orders
                    Customer? customer = random.Next(3) == 0 ? customers[random.Next(customers.Count)] : null;

                    var order = CreateSampleOrder(
                        defaultTenant.Id, defaultBranch.Id, admin.Id, shift.Id,
                        products, random, orderTime, (day * 100) + i + 1, status, customer
                    );
                    orders.Add(order);

                    if (status == OrderStatus.Completed)
                    {
                        var payment = order.Payments.FirstOrDefault();
                        if (payment != null)
                        {
                            if (payment.Method == PaymentMethod.Cash)
                                totalCash += payment.Amount;
                            else
                                totalCard += payment.Amount;
                        }
                    }
                }

                context.Orders.AddRange(orders);
                await context.SaveChangesAsync();

                // Update shift totals
                if (isClosed)
                {
                    var completedCount = orders.Count(o => o.Status == OrderStatus.Completed);
                    shift.TotalOrders = completedCount;
                    shift.TotalCash = totalCash;
                    shift.TotalCard = totalCard;
                    shift.ExpectedBalance = shift.OpeningBalance + totalCash;
                    shift.ClosingBalance = shift.ExpectedBalance + random.Next(-20, 50);
                    shift.Difference = shift.ClosingBalance - shift.ExpectedBalance;
                    await context.SaveChangesAsync();
                }
            }

            // Deduct stock for completed orders
            var completedOrders = await context.Orders
                .Include(o => o.Items)
                .Where(o => o.Status == OrderStatus.Completed)
                .ToListAsync();

            foreach (var order in completedOrders)
            {
                foreach (var item in order.Items)
                {
                    var product = await context.Products.FindAsync(item.ProductId);
                    if (product != null && product.StockQuantity.HasValue)
                    {
                        product.StockQuantity -= item.Quantity;
                        product.LastStockUpdate = order.CompletedAt ?? order.CreatedAt;
                    }
                }
            }
            await context.SaveChangesAsync();
        }
    }

    private static Order CreateSampleOrder(
        int tenantId, int branchId, int userId, int shiftId,
        List<Product> products, Random random, DateTime orderTime, int orderNum, 
        OrderStatus status, Customer? customer = null)
    {
        var order = new Order
        {
            TenantId = tenantId,
            BranchId = branchId,
            ShiftId = shiftId,
            OrderNumber = $"ORD-{orderTime:yyyyMMdd}-{orderNum:D4}",
            UserId = userId,
            Status = status,
            OrderType = random.Next(10) < 8 ? OrderType.DineIn : OrderType.Delivery,
            CreatedAt = orderTime,
            BranchName = "الفرع الرئيسي",
            BranchAddress = "شارع التحرير، وسط البلد، القاهرة",
            BranchPhone = "01000000001",
            UserName = "مدير النظام",
            CurrencyCode = "EGP",
            TaxRate = 14
        };

        // Add customer if provided
        if (customer != null)
        {
            order.CustomerId = customer.Id;
            order.CustomerName = customer.Name;
            order.CustomerPhone = customer.Phone;
        }

        var itemCount = random.Next(1, 5);
        decimal subtotal = 0;
        decimal taxAmount = 0;

        var usedProducts = new HashSet<int>();
        for (int j = 0; j < itemCount; j++)
        {
            Product product;
            do
            {
                product = products[random.Next(products.Count)];
            } while (usedProducts.Contains(product.Id) && usedProducts.Count < products.Count);
            
            usedProducts.Add(product.Id);
            var qty = random.Next(1, 4);
            
            var grossPrice = product.Price * qty;
            var netPrice = grossPrice / 1.14m;
            var itemTax = grossPrice - netPrice;

            var orderItem = new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ProductNameEn = product.NameEn,
                ProductSku = product.Sku,
                ProductBarcode = product.Barcode,
                UnitPrice = product.Price,
                UnitCost = product.Cost,
                OriginalPrice = product.Price,
                Quantity = qty,
                TaxRate = 14,
                TaxInclusive = true,
                TaxAmount = Math.Round(itemTax, 2),
                Subtotal = grossPrice,
                Total = grossPrice
            };

            order.Items.Add(orderItem);
            subtotal += grossPrice;
            taxAmount += itemTax;
        }

        order.Subtotal = subtotal;
        order.TaxAmount = Math.Round(taxAmount, 2);
        order.Total = subtotal;

        if (status == OrderStatus.Completed)
        {
            order.AmountPaid = order.Total;
            order.AmountDue = 0;
            order.CompletedAt = orderTime.AddMinutes(random.Next(5, 20));
            order.CompletedByUserId = userId;
            
            var paymentMethod = random.Next(10) < 7 ? PaymentMethod.Cash : 
                (random.Next(2) == 0 ? PaymentMethod.Card : PaymentMethod.Fawry);
            
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
