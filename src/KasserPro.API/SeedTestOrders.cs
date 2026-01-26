namespace KasserPro.API;

using KasserPro.Domain.Entities;
using KasserPro.Domain.Enums;
using KasserPro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

public static class SeedTestOrders
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Check if we already have enough test orders
        var existingOrders = await context.Orders.CountAsync();
        if (existingOrders >= 50)
        {
            Console.WriteLine($"Already have {existingOrders} orders. Skipping seed.");
            return;
        }

        Console.WriteLine("Seeding test orders...");

        // Get tenant, branch, user, and products
        var tenant = await context.Tenants.FirstOrDefaultAsync();
        var branch = await context.Branches.FirstOrDefaultAsync();
        var user = await context.Users.FirstOrDefaultAsync();
        var products = await context.Products.Take(5).ToListAsync();
        var customer = await context.Customers.FirstOrDefaultAsync();

        if (tenant == null || branch == null || user == null || !products.Any())
        {
            Console.WriteLine("Missing required data. Cannot seed orders.");
            return;
        }

        // Get or create a shift
        var shift = await context.Shifts.FirstOrDefaultAsync(s => !s.IsClosed);
        if (shift == null)
        {
            shift = new Shift
            {
                TenantId = tenant.Id,
                BranchId = branch.Id,
                UserId = user.Id,
                OpeningBalance = 1000,
                IsClosed = false,
                OpenedAt = DateTime.UtcNow.AddDays(-30)
            };
            context.Shifts.Add(shift);
            await context.SaveChangesAsync();
        }

        var random = new Random();
        var statuses = new[] { OrderStatus.Completed, OrderStatus.Cancelled, OrderStatus.Pending };
        var orderTypes = new[] { OrderType.DineIn, OrderType.Takeaway, OrderType.Delivery };

        // Create 50 test orders with different dates and statuses
        for (int i = 0; i < 50; i++)
        {
            var daysAgo = random.Next(0, 60); // Orders from last 60 days
            var createdAt = DateTime.UtcNow.AddDays(-daysAgo).AddHours(random.Next(0, 24));
            var status = statuses[random.Next(statuses.Length)];
            var orderType = orderTypes[random.Next(orderTypes.Length)];

            var order = new Order
            {
                TenantId = tenant.Id,
                BranchId = branch.Id,
                ShiftId = shift.Id,
                OrderNumber = $"ORD-{createdAt:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
                UserId = user.Id,
                UserName = user.Name,
                CustomerId = random.Next(0, 3) == 0 ? customer?.Id : null,
                CustomerName = random.Next(0, 3) == 0 ? customer?.Name : $"عميل {i + 1}",
                CustomerPhone = random.Next(0, 3) == 0 ? customer?.Phone : null,
                Status = status,
                OrderType = orderType,
                BranchName = branch.Name,
                BranchAddress = branch.Address,
                BranchPhone = branch.Phone,
                CurrencyCode = branch.CurrencyCode,
                TaxRate = tenant.TaxRate,
                CreatedAt = createdAt
            };

            // Add 1-3 items per order
            var itemCount = random.Next(1, 4);
            for (int j = 0; j < itemCount; j++)
            {
                var product = products[random.Next(products.Count)];
                var quantity = random.Next(1, 5);
                var unitPrice = product.Price;
                var taxRate = product.TaxRate ?? tenant.TaxRate;

                var orderItem = new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    ProductNameEn = product.NameEn,
                    ProductSku = product.Sku,
                    ProductBarcode = product.Barcode,
                    UnitPrice = unitPrice,
                    UnitCost = product.Cost,
                    OriginalPrice = unitPrice,
                    Quantity = quantity,
                    TaxRate = taxRate,
                    TaxInclusive = false
                };

                // Calculate totals
                orderItem.Subtotal = Math.Round(unitPrice * quantity, 2);
                orderItem.DiscountAmount = 0;
                orderItem.TaxAmount = Math.Round(orderItem.Subtotal * (taxRate / 100m), 2);
                orderItem.Total = Math.Round(orderItem.Subtotal + orderItem.TaxAmount, 2);

                order.Items.Add(orderItem);
            }

            // Calculate order totals
            order.Subtotal = Math.Round(order.Items.Sum(i => i.Subtotal), 2);
            order.TaxAmount = Math.Round(order.Items.Sum(i => i.TaxAmount), 2);
            order.DiscountAmount = 0;
            order.ServiceChargeAmount = 0;
            order.Total = Math.Round(order.Items.Sum(i => i.Total), 2);

            // Set payment info for completed orders
            if (status == OrderStatus.Completed)
            {
                order.AmountPaid = order.Total;
                order.AmountDue = 0;
                order.ChangeAmount = 0;
                order.CompletedAt = createdAt.AddMinutes(random.Next(5, 30));

                // Add payment
                var payment = new Payment
                {
                    TenantId = tenant.Id,
                    BranchId = branch.Id,
                    OrderId = order.Id,
                    Amount = order.Total,
                    Method = random.Next(0, 2) == 0 ? PaymentMethod.Cash : PaymentMethod.Card,
                    CreatedAt = order.CompletedAt.Value
                };
                order.Payments.Add(payment);
            }
            else if (status == OrderStatus.Cancelled)
            {
                order.CancelledAt = createdAt.AddMinutes(random.Next(1, 10));
                order.CancellationReason = "إلغاء تجريبي";
            }

            context.Orders.Add(order);
        }

        await context.SaveChangesAsync();
        Console.WriteLine($"✅ Successfully seeded 50 test orders!");
    }
}
