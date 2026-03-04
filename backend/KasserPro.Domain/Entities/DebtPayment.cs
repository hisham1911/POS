namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

/// <summary>
/// Tracks customer debt payments (credit sales repayment)
/// Provides full audit trail for all debt reduction transactions
/// </summary>
public class DebtPayment : BaseEntity
{
    public int TenantId { get; set; }
    public int BranchId { get; set; }
    
    /// <summary>
    /// Customer who made the payment
    /// </summary>
    public int CustomerId { get; set; }
    
    /// <summary>
    /// Amount paid towards debt
    /// </summary>
    public decimal Amount { get; set; }
    
    /// <summary>
    /// Payment method used
    /// </summary>
    public PaymentMethod PaymentMethod { get; set; }
    
    /// <summary>
    /// Optional reference number (check number, transaction ID, etc.)
    /// </summary>
    public string? ReferenceNumber { get; set; }
    
    /// <summary>
    /// Optional notes about the payment
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// User who recorded the payment
    /// </summary>
    public int RecordedByUserId { get; set; }
    
    /// <summary>
    /// User name snapshot
    /// </summary>
    public string? RecordedByUserName { get; set; }
    
    /// <summary>
    /// Shift during which payment was recorded (optional)
    /// </summary>
    public int? ShiftId { get; set; }
    
    /// <summary>
    /// Customer's TotalDue balance BEFORE this payment
    /// </summary>
    public decimal BalanceBefore { get; set; }
    
    /// <summary>
    /// Customer's TotalDue balance AFTER this payment
    /// </summary>
    public decimal BalanceAfter { get; set; }
    
    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public Customer Customer { get; set; } = null!;
    public User RecordedByUser { get; set; } = null!;
    public Shift? Shift { get; set; }
}
