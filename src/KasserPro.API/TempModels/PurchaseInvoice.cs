using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class PurchaseInvoice
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public int BranchId { get; set; }

    public string InvoiceNumber { get; set; } = null!;

    public int SupplierId { get; set; }

    public string SupplierName { get; set; } = null!;

    public string? SupplierPhone { get; set; }

    public string? SupplierAddress { get; set; }

    public DateTime InvoiceDate { get; set; }

    public int Status { get; set; }

    public decimal Subtotal { get; set; }

    public decimal TaxRate { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal Total { get; set; }

    public decimal AmountPaid { get; set; }

    public decimal AmountDue { get; set; }

    public string? Notes { get; set; }

    public int CreatedByUserId { get; set; }

    public string? CreatedByUserName { get; set; }

    public int? ConfirmedByUserId { get; set; }

    public string? ConfirmedByUserName { get; set; }

    public DateTime? ConfirmedAt { get; set; }

    public int? CancelledByUserId { get; set; }

    public string? CancelledByUserName { get; set; }

    public string? CancelledAt { get; set; }

    public string? CancellationReason { get; set; }

    public int InventoryAdjustedOnCancellation { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public virtual Branch Branch { get; set; } = null!;

    public virtual User? ConfirmedByUser { get; set; }

    public virtual User CreatedByUser { get; set; } = null!;

    public virtual ICollection<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; } = new List<PurchaseInvoiceItem>();

    public virtual ICollection<PurchaseInvoicePayment> PurchaseInvoicePayments { get; set; } = new List<PurchaseInvoicePayment>();

    public virtual Supplier Supplier { get; set; } = null!;

    public virtual Tenant Tenant { get; set; } = null!;
}
