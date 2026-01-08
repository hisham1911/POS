namespace KasserPro.Application.DTOs.Reports;

public class DailyReportDto
{
    public DateTime Date { get; set; }
    public int BranchId { get; set; }
    public string? BranchName { get; set; }
    
    // Order Counts
    public int TotalOrders { get; set; }
    public int CompletedOrders { get; set; }
    public int CancelledOrders { get; set; }
    public int PendingOrders { get; set; }
    
    // Sales Totals
    public decimal GrossSales { get; set; }      // Subtotal before discounts
    public decimal TotalDiscount { get; set; }
    public decimal NetSales { get; set; }        // After discounts, before tax
    public decimal TotalTax { get; set; }
    public decimal TotalSales { get; set; }      // Final total (Net + Tax)
    
    // Payment Breakdown
    public decimal TotalCash { get; set; }
    public decimal TotalCard { get; set; }
    public decimal TotalFawry { get; set; }
    public decimal TotalOther { get; set; }
    
    // Top Products
    public List<TopProductDto> TopProducts { get; set; } = new();
    
    // Hourly Breakdown (optional)
    public List<HourlySalesDto> HourlySales { get; set; } = new();
}

public class TopProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal TotalSales { get; set; }
}

public class HourlySalesDto
{
    public int Hour { get; set; }
    public int OrderCount { get; set; }
    public decimal Sales { get; set; }
}

public class SalesReportDto
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public decimal TotalSales { get; set; }
    public decimal TotalCost { get; set; }
    public decimal GrossProfit { get; set; }
    public int TotalOrders { get; set; }
    public decimal AverageOrderValue { get; set; }
    public List<DailySalesDto> DailySales { get; set; } = new();
}

public class DailySalesDto
{
    public DateTime Date { get; set; }
    public decimal Sales { get; set; }
    public int Orders { get; set; }
}
