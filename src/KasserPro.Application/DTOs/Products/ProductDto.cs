namespace KasserPro.Application.DTOs.Products;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Description { get; set; }
    public string? Sku { get; set; }
    public string? Barcode { get; set; }
    public decimal Price { get; set; }
    public decimal? Cost { get; set; }
    public decimal? TaxRate { get; set; }
    public bool TaxInclusive { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public bool TrackInventory { get; set; }
    public int? StockQuantity { get; set; }
    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }
}
