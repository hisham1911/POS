using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class SupplierProduct
{
    public int Id { get; set; }

    public int SupplierId { get; set; }

    public int ProductId { get; set; }

    public int IsPreferred { get; set; }

    public string? LastPurchasePrice { get; set; }

    public string? LastPurchaseDate { get; set; }

    public int TotalQuantityPurchased { get; set; }

    public string TotalAmountSpent { get; set; } = null!;

    public string? Notes { get; set; }

    public string CreatedAt { get; set; } = null!;

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual Supplier Supplier { get; set; } = null!;
}
