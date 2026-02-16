using System.ComponentModel.DataAnnotations;
using KasserPro.Domain.Enums;

namespace KasserPro.Application.DTOs.CashRegister;

/// <summary>
/// Request DTO for creating a cash register transaction (Deposit/Withdrawal)
/// </summary>
public class CreateCashRegisterTransactionRequest
{
    [Required(ErrorMessage = "CASH_REGISTER_TYPE_REQUIRED")]
    public CashRegisterTransactionType Type { get; set; }
    
    [Required(ErrorMessage = "CASH_REGISTER_AMOUNT_REQUIRED")]
    [Range(0.01, double.MaxValue, ErrorMessage = "CASH_REGISTER_INVALID_AMOUNT")]
    public decimal Amount { get; set; }
    
    [Required(ErrorMessage = "CASH_REGISTER_DESCRIPTION_REQUIRED")]
    [StringLength(500, ErrorMessage = "CASH_REGISTER_DESCRIPTION_TOO_LONG")]
    public string Description { get; set; } = string.Empty;
    
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
}
