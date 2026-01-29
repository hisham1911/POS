using System.ComponentModel.DataAnnotations;
using KasserPro.Domain.Enums;

namespace KasserPro.Application.DTOs.Expenses;

/// <summary>
/// Request DTO for paying an expense (Admin only)
/// </summary>
public class PayExpenseRequest
{
    [Required(ErrorMessage = "EXPENSE_PAYMENT_METHOD_REQUIRED")]
    public PaymentMethod PaymentMethod { get; set; }
    
    [Required(ErrorMessage = "EXPENSE_PAYMENT_DATE_REQUIRED")]
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    
    [StringLength(100, ErrorMessage = "EXPENSE_PAYMENT_REFERENCE_TOO_LONG")]
    public string? PaymentReferenceNumber { get; set; }
    
    [StringLength(500, ErrorMessage = "EXPENSE_NOTES_TOO_LONG")]
    public string? Notes { get; set; }
}
