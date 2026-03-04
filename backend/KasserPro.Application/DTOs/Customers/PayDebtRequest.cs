namespace KasserPro.Application.DTOs.Customers;

using KasserPro.Domain.Enums;

/// <summary>
/// Request to record a debt payment from a customer
/// </summary>
public class PayDebtRequest
{
    /// <summary>
    /// Amount being paid (must be > 0 and <= customer's TotalDue)
    /// </summary>
    public decimal Amount { get; set; }
    
    /// <summary>
    /// Payment method used
    /// </summary>
    public PaymentMethod PaymentMethod { get; set; }
    
    /// <summary>
    /// Optional reference number (check number, transaction ID, etc.)
    /// </summary>
    public string? ReferenceNumber { get; set; }
    
    /// <summary>
    /// Optional notes about the payment
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Response after recording a debt payment
/// </summary>
public class PayDebtResponse
{
    public int PaymentId { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal BalanceBefore { get; set; }
    public decimal BalanceAfter { get; set; }
    public decimal RemainingDebt { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Debt payment history item
/// </summary>
public class DebtPaymentDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public int RecordedByUserId { get; set; }
    public string? RecordedByUserName { get; set; }
    public int? ShiftId { get; set; }
    public decimal BalanceBefore { get; set; }
    public decimal BalanceAfter { get; set; }
    public DateTime CreatedAt { get; set; }
}
