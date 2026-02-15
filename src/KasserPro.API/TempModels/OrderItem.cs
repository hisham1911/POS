using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class OrderItem
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public string ProductName { get; set; } = null!;

    public decimal UnitPrice { get; set; }

    public decimal? UnitCost { get; set; }

    public int Quantity { get; set; }

    public decimal DiscountAmount { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal Total { get; set; }

    public string? Notes { get; set; }

    public int OrderId { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public string? DiscountReason { get; set; }

    public string? DiscountType { get; set; }

    public string? DiscountValue { get; set; }

    public decimal OriginalPrice { get; set; }

    public string? ProductBarcode { get; set; }

    public string? ProductNameEn { get; set; }

    public string? ProductSku { get; set; }

    public decimal Subtotal { get; set; }

    public int TaxInclusive { get; set; }

    public decimal TaxRate { get; set; }

    public virtual Order Order { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}
