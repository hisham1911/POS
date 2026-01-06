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

    public ReportService(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<ApiResponse<DailyReportDto>> GetDailyReportAsync(DateTime? date = null)
    {
        var reportDate = date?.Date ?? DateTime.UtcNow.Date;

        var orders = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .Include(o => o.Payments)
            .Where(o => o.CreatedAt.Date == reportDate)
            .ToListAsync();

        var completedOrders = orders.Where(o => o.Status == OrderStatus.Completed).ToList();

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

        var report = new DailyReportDto
        {
            Date = reportDate,
            TotalOrders = orders.Count,
            CompletedOrders = completedOrders.Count,
            CancelledOrders = orders.Count(o => o.Status == OrderStatus.Cancelled),
            TotalSales = completedOrders.Sum(o => o.Total),
            TotalCash = completedOrders.SelectMany(o => o.Payments)
                .Where(p => p.Method == PaymentMethod.Cash).Sum(p => p.Amount),
            TotalCard = completedOrders.SelectMany(o => o.Payments)
                .Where(p => p.Method != PaymentMethod.Cash).Sum(p => p.Amount),
            TotalTax = completedOrders.Sum(o => o.TaxAmount),
            TotalDiscount = completedOrders.Sum(o => o.DiscountAmount),
            TopProducts = topProducts
        };

        return ApiResponse<DailyReportDto>.Ok(report);
    }

    public async Task<ApiResponse<SalesReportDto>> GetSalesReportAsync(DateTime fromDate, DateTime toDate)
    {
        var orders = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .Where(o => o.Status == OrderStatus.Completed &&
                       o.CompletedAt >= fromDate.Date &&
                       o.CompletedAt < toDate.Date.AddDays(1))
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
