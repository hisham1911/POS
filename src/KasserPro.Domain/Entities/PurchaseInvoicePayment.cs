namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

/// <summary>
/// Represents a payment made for a purchase invoice
/// </summary>
public class PurchaseInvoicePayment : BaseEntity
{
    public int PurchaseInvoiceId { get; set; }
    
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public PaymentMethod Method { get; set; }
    
    /// <summary>
    /// Reference number (check number, transfer ID, etc.)
    /// </summary>
    public string? ReferenceNumber { get; set; }
    
    public string? Notes { get; set; }
    
    public int CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    
    // Navigation properties
    public PurchaseInvoice PurchaseInvoice { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;
}
