namespace KasserPro.Application.DTOs.PurchaseInvoices;

public class SupplierProductDto
{
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public bool IsPreferred { get; set; }
    public decimal? LastPurchasePrice { get; set; }
    public DateTime? LastPurchaseDate { get; set; }
    public int TotalQuantityPurchased { get; set; }
    public decimal TotalAmountSpent { get; set; }
}

public class LinkSupplierProductRequest
{
    public int ProductId { get; set; }
    public bool IsPreferred { get; set; } = false;
    public string? Notes { get; set; }
}
