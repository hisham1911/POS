using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class PurchaseInvoiceItem
{
    public int Id { get; set; }

    public int PurchaseInvoiceId { get; set; }

    public int ProductId { get; set; }

    public string ProductName { get; set; } = null!;

    public string? ProductNameEn { get; set; }

    public string? ProductSku { get; set; }

    public string? ProductBarcode { get; set; }

    public int Quantity { get; set; }

    public decimal PurchasePrice { get; set; }

    public decimal Total { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual PurchaseInvoice PurchaseInvoice { get; set; } = null!;
}
