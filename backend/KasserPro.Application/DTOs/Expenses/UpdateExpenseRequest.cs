using System.ComponentModel.DataAnnotations;

namespace KasserPro.Application.DTOs.Expenses;

/// <summary>
/// Request DTO for updating an expense (Draft only)
/// </summary>
public class UpdateExpenseRequest
{
    [Required(ErrorMessage = "EXPENSE_CATEGORY_REQUIRED")]
    public int CategoryId { get; set; }
    
    [Required(ErrorMessage = "EXPENSE_AMOUNT_REQUIRED")]
    [Range(0.01, double.MaxValue, ErrorMessage = "EXPENSE_INVALID_AMOUNT")]
    public decimal Amount { get; set; }
    
    [Required(ErrorMessage = "EXPENSE_DATE_REQUIRED")]
    public DateTime ExpenseDate { get; set; }
    
    [Required(ErrorMessage = "EXPENSE_DESCRIPTION_REQUIRED")]
    [StringLength(500, ErrorMessage = "EXPENSE_DESCRIPTION_TOO_LONG")]
    public string Description { get; set; } = string.Empty;
    
    [StringLength(200, ErrorMessage = "EXPENSE_BENEFICIARY_TOO_LONG")]
    public string? Beneficiary { get; set; }
    
    [StringLength(100, ErrorMessage = "EXPENSE_REFERENCE_TOO_LONG")]
    public string? ReferenceNumber { get; set; }
    
    [StringLength(1000, ErrorMessage = "EXPENSE_NOTES_TOO_LONG")]
    public string? Notes { get; set; }
}
