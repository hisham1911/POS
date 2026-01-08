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

        // Filter completed orders for sales calculations
        var completedOrders = orders.Where(o => o.Status == OrderStatus.Completed).ToList();

        // Calculate payment breakdown
        var allPayments = completedOrders.SelectMany(o => o.Payments).ToList();
        var totalCash = allPayments.Where(p => p.Method == PaymentMethod.Cash).Sum(p => p.Amount);
        var totalCard = allPayments.Where(p => p.Method == PaymentMethod.Card).Sum(p => p.Amount);
        var totalFawry = allPayments.Where(p => p.Method == PaymentMethod.Fawry).Sum(p => p.Amount);
        var totalOther = allPayments.Where(p => p.Method != PaymentMethod.Cash 
                                              && p.Method != PaymentMethod.Card 
                                              && p.Method != PaymentMethod.Fawry).Sum(p => p.Amount);

        // Calculate sales totals
        var grossSales = completedOrders.Sum(o => o.Subtotal);
        var totalDiscount = completedOrders.Sum(o => o.DiscountAmount);
        var totalTax = completedOrders.Sum(o => o.TaxAmount);
        var totalSales = completedOrders.Sum(o => o.Total);
        var netSales = grossSales - totalDiscount;

        // Top products
        var topProducts = completedOrders
            .SelectMany(o => o.Items)
            .GroupBy(i => new { i.ProductId, i.ProductName })
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.ProductName,
                QuantitySold = g.Sum(i => i.Quantity),
                TotalSales = g.Sum(i => i.Total)
            })
            .OrderByDescending(p => p.QuantitySold)
            .Take(10)
            .ToList();

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
            
            // Sales Totals
            GrossSales = grossSales,
            TotalDiscount = totalDiscount,
            NetSales = netSales,
            TotalTax = totalTax,
            TotalSales = totalSales,
            
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
