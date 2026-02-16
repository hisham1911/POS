using System.ComponentModel.DataAnnotations;

namespace KasserPro.Application.DTOs.Expenses;

/// <summary>
/// Request DTO for rejecting an expense (Admin only)
/// </summary>
public class RejectExpenseRequest
{
    [Required(ErrorMessage = "EXPENSE_REJECTION_REASON_REQUIRED")]
    [StringLength(500, ErrorMessage = "EXPENSE_REJECTION_REASON_TOO_LONG")]
    public string RejectionReason { get; set; } = string.Empty;
}
