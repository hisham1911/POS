using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class Supplier
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public int BranchId { get; set; }

    public string Name { get; set; } = null!;

    public string? NameEn { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }

    public string? TaxNumber { get; set; }

    public string? ContactPerson { get; set; }

    public string? Notes { get; set; }

    public int IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public string? LastPurchaseDate { get; set; }

    public decimal TotalDue { get; set; }

    public decimal TotalPaid { get; set; }

    public decimal TotalPurchases { get; set; }

    public virtual Branch Branch { get; set; } = null!;

    public virtual ICollection<PurchaseInvoice> PurchaseInvoices { get; set; } = new List<PurchaseInvoice>();

    public virtual ICollection<SupplierProduct> SupplierProducts { get; set; } = new List<SupplierProduct>();

    public virtual Tenant Tenant { get; set; } = null!;
}
