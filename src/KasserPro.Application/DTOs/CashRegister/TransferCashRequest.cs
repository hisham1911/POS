using System.ComponentModel.DataAnnotations;

namespace KasserPro.Application.DTOs.CashRegister;

/// <summary>
/// Request DTO for transferring cash between branches
/// </summary>
public class TransferCashRequest
{
    [Required(ErrorMessage = "CASH_REGISTER_SOURCE_BRANCH_REQUIRED")]
    public int SourceBranchId { get; set; }
    
    [Required(ErrorMessage = "CASH_REGISTER_TARGET_BRANCH_REQUIRED")]
    public int TargetBranchId { get; set; }
    
    [Required(ErrorMessage = "CASH_REGISTER_AMOUNT_REQUIRED")]
    [Range(0.01, double.MaxValue, ErrorMessage = "CASH_REGISTER_INVALID_AMOUNT")]
    public decimal Amount { get; set; }
    
    [Required(ErrorMessage = "CASH_REGISTER_DESCRIPTION_REQUIRED")]
    [StringLength(500, ErrorMessage = "CASH_REGISTER_DESCRIPTION_TOO_LONG")]
    public string Description { get; set; } = string.Empty;
    
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
}
