namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class OrderItem : BaseEntity
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal? UnitCost { get; set; }

    public int Quantity { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }

    public string? Notes { get; set; }

    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
