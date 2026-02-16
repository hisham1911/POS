using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class PurchaseInvoicePayment
{
    public int Id { get; set; }

    public int PurchaseInvoiceId { get; set; }

    public decimal Amount { get; set; }

    public DateTime PaymentDate { get; set; }

    public int Method { get; set; }

    public string? ReferenceNumber { get; set; }

    public string? Notes { get; set; }

    public int CreatedByUserId { get; set; }

    public string? CreatedByUserName { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public virtual User CreatedByUser { get; set; } = null!;

    public virtual PurchaseInvoice PurchaseInvoice { get; set; } = null!;
}
