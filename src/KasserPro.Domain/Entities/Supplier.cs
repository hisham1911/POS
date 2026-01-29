namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class Supplier : BaseEntity
{
    public int TenantId { get; set; }
    public int BranchId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? TaxNumber { get; set; }
    public string? ContactPerson { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Total amount owed to this supplier
    /// </summary>
    public decimal TotalDue { get; set; } = 0;
    
    /// <summary>
    /// Total amount paid to this supplier (lifetime)
    /// </summary>
    public decimal TotalPaid { get; set; } = 0;
    
    /// <summary>
    /// Total purchases from this supplier (lifetime)
    /// </summary>
    public decimal TotalPurchases { get; set; } = 0;
    
    /// <summary>
    /// Date of last purchase from this supplier
    /// </summary>
    public DateTime? LastPurchaseDate { get; set; }
    
    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public ICollection<SupplierProduct> SupplierProducts { get; set; } = new List<SupplierProduct>();
    public ICollection<PurchaseInvoice> PurchaseInvoices { get; set; } = new List<PurchaseInvoice>();
}
