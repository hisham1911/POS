namespace KasserPro.Application.Services.Implementations;

using Microsoft.EntityFrameworkCore;
using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Reports;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Enums;

public class ReportService : IReportService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ReportService(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<DailyReportDto>> GetDailyReportAsync(DateTime? date = null)
    {
        var reportDate = date?.Date ?? DateTime.UtcNow.Date;
        var tenantId = _currentUser.TenantId;
        var branchId = _currentUser.BranchId;

        // Get branch info for report
        var branch = await _unitOfWork.Branches.GetByIdAsync(branchId);

        // Query orders for the specific date, tenant, and branch
        var orders = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .Include(o => o.Payments)
            .Where(o => o.TenantId == tenantId 
                     && o.BranchId == branchId 
                     && o.CreatedAt.Date == reportDate)
            .ToListAsync();

        // Filter completed orders for sales calculations (EXCLUDE Return orders)
        // Include: Completed, PartiallyRefunded, and Refunded orders
        var completedOrders = orders
            .Where(o => (o.Status == OrderStatus.Completed 
                      || o.Status == OrderStatus.PartiallyRefunded 
                      || o.Status == OrderStatus.Refunded) 
                     && o.OrderType != OrderType.Return)
            .ToList();
        
        // Get return orders separately for refund calculations
        var returnOrders = orders
            .Where(o => (o.Status == OrderStatus.Completed 
                      || o.Status == OrderStatus.PartiallyRefunded 
                      || o.Status == OrderStatus.Refunded) 
                     && o.OrderType == OrderType.Return)
            .ToList();

        // DEBUG LOGGING
        Console.WriteLine($"=== DAILY REPORT DEBUG ===");
        Console.WriteLine($"Report Date: {reportDate:yyyy-MM-dd}");
        Console.WriteLine($"Total orders loaded: {orders.Count}");
        Console.WriteLine($"Completed orders (excl. returns): {completedOrders.Count}");
        Console.WriteLine($"Return orders: {returnOrders.Count}");
        
        foreach (var order in completedOrders)
        {
            Console.WriteLine($"  Order #{order.OrderNumber}: {order.Items.Count} items, Status: {order.Status}, Created: {order.CreatedAt:yyyy-MM-dd HH:mm}, Completed: {order.CompletedAt:yyyy-MM-dd HH:mm}");
            foreach (var item in order.Items)
            {
                Console.WriteLine($"    - {item.ProductName} x{item.Quantity} = {item.Total} EGP");
            }
        }
        
        Console.WriteLine($"\nReturn Orders:");
        foreach (var order in returnOrders)
        {
            Console.WriteLine($"  Return Order #{order.OrderNumber}: {order.Items.Count} items");
            foreach (var item in order.Items)
            {
                Console.WriteLine($"    - {item.ProductName} x{item.Quantity} = {item.Total} EGP");
            }
        }
        Console.WriteLine($"=========================");

        // Calculate payment breakdown
        var allPayments = completedOrders.SelectMany(o => o.Payments).ToList();
        var totalCash = allPayments.Where(p => p.Method == PaymentMethod.Cash).Sum(p => p.Amount);
        var totalCard = allPayments.Where(p => p.Method == PaymentMethod.Card).Sum(p => p.Amount);
        var totalFawry = allPayments.Where(p => p.Method == PaymentMethod.Fawry).Sum(p => p.Amount);
        var totalOther = allPayments.Where(p => p.Method != PaymentMethod.Cash 
                                              && p.Method != PaymentMethod.Card 
                                              && p.Method != PaymentMethod.Fawry).Sum(p => p.Amount);

        // Calculate sales totals (INCLUDING refund adjustments)
        var grossSales = completedOrders.Sum(o => o.Subtotal);
        var totalDiscount = completedOrders.Sum(o => o.DiscountAmount);
        var totalTax = completedOrders.Sum(o => o.TaxAmount);
        var totalSales = completedOrders.Sum(o => o.Total);
        var netSales = grossSales - totalDiscount;
        
        // Calculate refunds from return orders
        var totalRefunds = Math.Abs(returnOrders.Sum(o => o.Total)); // Make positive for display
        
        // Adjust sales totals by subtracting refunds for ACTUAL sales
        var actualGrossSales = grossSales - Math.Abs(returnOrders.Sum(o => o.Subtotal));
        var actualTotalTax = totalTax - Math.Abs(returnOrders.Sum(o => o.TaxAmount));
        var actualTotalSales = totalSales - totalRefunds;
        var actualNetSales = netSales - Math.Abs(returnOrders.Sum(o => o.Subtotal - o.DiscountAmount));

        // Top products - Calculate NET quantities (sales - returns)
        var allSalesItems = completedOrders.SelectMany(o => o.Items).ToList();
        var allReturnItems = returnOrders.SelectMany(o => o.Items).ToList();
        
        Console.WriteLine($"Total items from completed orders: {allSalesItems.Count}");
        Console.WriteLine($"Total items from return orders: {allReturnItems.Count}");
        
        // Group sales items
        var salesByProduct = allSalesItems
            .GroupBy(i => new { i.ProductId, i.ProductName })
            .Select(g => new
            {
                g.Key.ProductId,
                g.Key.ProductName,
                QuantitySold = g.Sum(i => i.Quantity),
                TotalSales = g.Sum(i => i.Total)
            })
            .ToList();
        
        // Group return items
        var returnsByProduct = allReturnItems
            .GroupBy(i => new { i.ProductId, i.ProductName })
            .Select(g => new
            {
                g.Key.ProductId,
                g.Key.ProductName,
                QuantityReturned = Math.Abs(g.Sum(i => i.Quantity)), // Make positive
                TotalReturns = Math.Abs(g.Sum(i => i.Total)) // Make positive
            })
            .ToDictionary(x => x.ProductId);
        
        // Calculate NET sales (sales - returns) for each product
        var topProducts = salesByProduct
            .Select(s => new TopProductDto
            {
                ProductId = s.ProductId,
                ProductName = s.ProductName,
                QuantitySold = s.QuantitySold - (returnsByProduct.ContainsKey(s.ProductId) ? returnsByProduct[s.ProductId].QuantityReturned : 0),
                TotalSales = s.TotalSales - (returnsByProduct.ContainsKey(s.ProductId) ? returnsByProduct[s.ProductId].TotalReturns : 0)
            })
            .Where(p => p.QuantitySold > 0) // Only show products with net positive sales
            .OrderByDescending(p => p.QuantitySold)
            .Take(10)
            .ToList();
        
        Console.WriteLine($"Top products count (after subtracting returns): {topProducts.Count}");
        foreach (var product in topProducts)
        {
            Console.WriteLine($"  - {product.ProductName}: {product.QuantitySold} units (net), {product.TotalSales} EGP (net)");
        }

        // Hourly breakdown
        var hourlySales = completedOrders
            .GroupBy(o => o.CompletedAt?.Hour ?? o.CreatedAt.Hour)
            .Select(g => new HourlySalesDto
            {
                Hour = g.Key,
                OrderCount = g.Count(),
                Sales = g.Sum(o => o.Total)
            })
            .OrderBy(h => h.Hour)
            .ToList();

        var report = new DailyReportDto
        {
            Date = reportDate,
            BranchId = branchId,
            BranchName = branch?.Name,
            
            // Order Counts
            TotalOrders = orders.Count,
            CompletedOrders = completedOrders.Count,
            CancelledOrders = orders.Count(o => o.Status == OrderStatus.Cancelled),
            PendingOrders = orders.Count(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.Draft),
            
            // Sales Totals (ACTUAL - after subtracting refunds)
            GrossSales = actualGrossSales,
            TotalDiscount = totalDiscount, // Discount stays the same (from original orders)
            NetSales = actualNetSales,
            TotalTax = actualTotalTax,
            TotalSales = actualTotalSales,
            TotalRefunds = totalRefunds,
            
            // Payment Breakdown
            TotalCash = totalCash,
            TotalCard = totalCard,
            TotalFawry = totalFawry,
            TotalOther = totalOther,
            
            // Details
            TopProducts = topProducts,
            HourlySales = hourlySales
        };

        return ApiResponse<DailyReportDto>.Ok(report);
    }

    public async Task<ApiResponse<SalesReportDto>> GetSalesReportAsync(DateTime fromDate, DateTime toDate)
    {
        var tenantId = _currentUser.TenantId;
        var branchId = _currentUser.BranchId;

        var orders = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .Where(o => o.TenantId == tenantId 
                     && o.BranchId == branchId
                     && o.Status == OrderStatus.Completed 
                     && o.CompletedAt >= fromDate.Date 
                     && o.CompletedAt < toDate.Date.AddDays(1))
            .ToListAsync();

        var totalSales = orders.Sum(o => o.Total);
        var totalCost = orders.SelectMany(o => o.Items)
            .Sum(i => (i.UnitCost ?? 0) * i.Quantity);

        var dailySales = orders
            .GroupBy(o => o.CompletedAt!.Value.Date)
            .Select(g => new DailySalesDto
            {
                Date = g.Key,
                Sales = g.Sum(o => o.Total),
                Orders = g.Count()
            })
            .OrderBy(d => d.Date)
            .ToList();

        var report = new SalesReportDto
        {
            FromDate = fromDate,
            ToDate = toDate,
            TotalSales = totalSales,
            TotalCost = totalCost,
            GrossProfit = totalSales - totalCost,
            TotalOrders = orders.Count,
            AverageOrderValue = orders.Count > 0 ? totalSales / orders.Count : 0,
            DailySales = dailySales
        };

        return ApiResponse<SalesReportDto>.Ok(report);
    }
}
