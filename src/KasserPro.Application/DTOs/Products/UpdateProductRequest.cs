namespace KasserPro.Application.DTOs.Products;

public class UpdateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Description { get; set; }
    public string? Sku { get; set; }
    public string? Barcode { get; set; }
    public decimal Price { get; set; }
    public decimal? Cost { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public int CategoryId { get; set; }
    
    // Tax settings
    public decimal? TaxRate { get; set; }
    public bool TaxInclusive { get; set; } = true;
    
    // Inventory fields
    public int StockQuantity { get; set; } = 0;
    public int LowStockThreshold { get; set; } = 5;
    public int? ReorderPoint { get; set; }
}
