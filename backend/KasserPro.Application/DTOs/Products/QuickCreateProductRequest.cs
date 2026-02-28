namespace KasserPro.Application.DTOs.Products;

public class QuickCreateProductRequest
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public bool TrackInventory { get; set; } = false;
    public int InitialStock { get; set; } = 0;
    public string? Sku { get; set; }
    public string? Barcode { get; set; }
}
