using System.ComponentModel.DataAnnotations;

namespace KasserPro.Application.DTOs.CashRegister;

/// <summary>
/// Request DTO for reconciling cash register at shift close
/// </summary>
public class ReconcileCashRegisterRequest
{
    [Required(ErrorMessage = "CASH_REGISTER_ACTUAL_BALANCE_REQUIRED")]
    [Range(0, double.MaxValue, ErrorMessage = "CASH_REGISTER_INVALID_BALANCE")]
    public decimal ActualBalance { get; set; }
    
    [StringLength(500, ErrorMessage = "CASH_REGISTER_VARIANCE_REASON_TOO_LONG")]
    public string? VarianceReason { get; set; }
}
