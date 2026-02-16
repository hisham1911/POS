namespace KasserPro.Application.DTOs.CashRegister;

/// <summary>
/// DTO for Cash Register Transaction
/// </summary>
public class CashRegisterTransactionDto
{
    public int Id { get; set; }
    public string TransactionNumber { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal BalanceBefore { get; set; }
    public decimal BalanceAfter { get; set; }
    public DateTime TransactionDate { get; set; }
    public string Description { get; set; } = string.Empty;
    
    public string? ReferenceType { get; set; }
    public int? ReferenceId { get; set; }
    
    public int? ShiftId { get; set; }
    public string? ShiftNumber { get; set; }
    
    public int? TransferReferenceId { get; set; }
    
    public string UserName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
