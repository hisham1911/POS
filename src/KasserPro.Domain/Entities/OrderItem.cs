namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class OrderItem : BaseEntity
{
    public int ProductId { get; set; }
    
    // Product Snapshot (immutable at order time)
    public string ProductName { get; set; } = string.Empty;
    public string? ProductNameEn { get; set; }
    public string? ProductSku { get; set; }
    public string? ProductBarcode { get; set; }
    
    // Price Snapshot
    public decimal UnitPrice { get; set; }
    public decimal? UnitCost { get; set; }
    public decimal OriginalPrice { get; set; } // Price before any discount

    public int Quantity { get; set; }
    
    // Discount Snapshot
    public string? DiscountType { get; set; } // "percentage" or "fixed"
    public decimal? DiscountValue { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public string? DiscountReason { get; set; }
    
    // Tax Snapshot
    public decimal TaxRate { get; set; } = 14;
    public decimal TaxAmount { get; set; }
    public bool TaxInclusive { get; set; } = true;
    
    public decimal Subtotal { get; set; }
    public decimal Total { get; set; }

    public string? Notes { get; set; }

    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
