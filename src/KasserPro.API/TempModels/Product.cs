using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class Product
{
    public int Id { get; set; }

    public string? Barcode { get; set; }

    public int CategoryId { get; set; }

    public decimal? Cost { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public int IsActive { get; set; }

    public int IsDeleted { get; set; }

    public string Name { get; set; } = null!;

    public string? NameEn { get; set; }

    public decimal Price { get; set; }

    public string? Sku { get; set; }

    public int? StockQuantity { get; set; }

    public int TenantId { get; set; }

    public int TrackInventory { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int TaxInclusive { get; set; }

    public decimal? TaxRate { get; set; }

    public DateTime? LastStockUpdate { get; set; }

    public int? LowStockThreshold { get; set; }

    public int? ReorderPoint { get; set; }

    public string? AverageCost { get; set; }

    public DateTime? LastPurchaseDate { get; set; }

    public decimal? LastPurchasePrice { get; set; }

    public virtual ICollection<BranchInventory> BranchInventories { get; set; } = new List<BranchInventory>();

    public virtual ICollection<BranchProductPrice> BranchProductPrices { get; set; } = new List<BranchProductPrice>();

    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<InventoryTransfer> InventoryTransfers { get; set; } = new List<InventoryTransfer>();

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; } = new List<PurchaseInvoiceItem>();

    public virtual ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();

    public virtual ICollection<SupplierProduct> SupplierProducts { get; set; } = new List<SupplierProduct>();

    public virtual Tenant Tenant { get; set; } = null!;
}
