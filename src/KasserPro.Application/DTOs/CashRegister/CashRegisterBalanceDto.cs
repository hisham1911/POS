namespace KasserPro.Application.DTOs.CashRegister;

/// <summary>
/// DTO for current cash register balance
/// </summary>
public class CashRegisterBalanceDto
{
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public decimal CurrentBalance { get; set; }
    public DateTime LastTransactionDate { get; set; }
    public int? ActiveShiftId { get; set; }
    public string? ActiveShiftNumber { get; set; }
}
