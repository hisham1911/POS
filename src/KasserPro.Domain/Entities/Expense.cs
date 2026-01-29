namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

/// <summary>
/// Represents a business expense
/// </summary>
public class Expense : BaseEntity
{
    public int TenantId { get; set; }
    public int BranchId { get; set; }
    
    /// <summary>
    /// Auto-generated expense number (e.g., EXP-2026-0001)
    /// </summary>
    public string ExpenseNumber { get; set; } = string.Empty;
    
    public int CategoryId { get; set; }
    
    /// <summary>
    /// Expense amount
    /// </summary>
    public decimal Amount { get; set; }
    
    /// <summary>
    /// Date when the expense occurred
    /// </summary>
    public DateTime ExpenseDate { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Description of the expense (required)
    /// </summary>
    public string Description { get; set; } = string.Empty;
    
    /// <summary>
    /// Beneficiary/Payee name (optional)
    /// </summary>
    public string? Beneficiary { get; set; }
    
    /// <summary>
    /// External reference number (invoice number, receipt number, etc.)
    /// </summary>
    public string? ReferenceNumber { get; set; }
    
    /// <summary>
    /// Additional notes
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// Current status of the expense
    /// </summary>
    public ExpenseStatus Status { get; set; } = ExpenseStatus.Draft;
    
    /// <summary>
    /// Optional link to shift (for shift-level expenses)
    /// </summary>
    public int? ShiftId { get; set; }
    
    // Payment information
    /// <summary>
    /// Payment method used (null if not paid yet)
    /// </summary>
    public PaymentMethod? PaymentMethod { get; set; }
    
    /// <summary>
    /// Date when payment was made
    /// </summary>
    public DateTime? PaymentDate { get; set; }
    
    /// <summary>
    /// Payment reference number (for card/bank transfer)
    /// </summary>
    public string? PaymentReferenceNumber { get; set; }
    
    // Audit trail - Created
    public int CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    
    // Audit trail - Approved
    public int? ApprovedByUserId { get; set; }
    public string? ApprovedByUserName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    
    // Audit trail - Paid
    public int? PaidByUserId { get; set; }
    public string? PaidByUserName { get; set; }
    public DateTime? PaidAt { get; set; }
    
    // Audit trail - Rejected
    public int? RejectedByUserId { get; set; }
    public string? RejectedByUserName { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectionReason { get; set; }
    
    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public ExpenseCategory Category { get; set; } = null!;
    public Shift? Shift { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public User? ApprovedByUser { get; set; }
    public User? PaidByUser { get; set; }
    public User? RejectedByUser { get; set; }
    public ICollection<ExpenseAttachment> Attachments { get; set; } = new List<ExpenseAttachment>();
}
