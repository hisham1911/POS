using System.ComponentModel.DataAnnotations;

namespace KasserPro.Application.DTOs.Expenses;

/// <summary>
/// Request DTO for approving an expense (Admin only)
/// </summary>
public class ApproveExpenseRequest
{
    [StringLength(500, ErrorMessage = "EXPENSE_NOTES_TOO_LONG")]
    public string? Notes { get; set; }
}
