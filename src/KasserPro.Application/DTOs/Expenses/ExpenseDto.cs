namespace KasserPro.Application.DTOs.Expenses;

/// <summary>
/// DTO for Expense entity
/// </summary>
public class ExpenseDto
{
    public int Id { get; set; }
    public string ExpenseNumber { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? CategoryIcon { get; set; }
    public string? CategoryColor { get; set; }
    
    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Beneficiary { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    
    public string Status { get; set; } = string.Empty;
    
    public int? ShiftId { get; set; }
    public string? ShiftNumber { get; set; }
    
    public string? PaymentMethod { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? PaymentReferenceNumber { get; set; }
    
    // Audit Trail
    public string CreatedByUserName { get; set; } = string.Empty;
    public string? ApprovedByUserName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? PaidByUserName { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? RejectedByUserName { get; set; }
    public DateTime? RejectedAt { get; set; }
    public string? RejectionReason { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    public List<ExpenseAttachmentDto> Attachments { get; set; } = new();
}
