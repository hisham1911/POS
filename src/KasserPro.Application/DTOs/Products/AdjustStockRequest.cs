namespace KasserPro.Application.DTOs.Products;

public class AdjustStockRequest
{
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string AdjustmentType { get; set; } = "Adjustment";
}

public class StockAdjustResultDto
{
    public int NewBalance { get; set; }
    public int PreviousBalance { get; set; }
    public int Change { get; set; }
}
