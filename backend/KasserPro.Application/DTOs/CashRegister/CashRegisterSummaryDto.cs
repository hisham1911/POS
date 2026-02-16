namespace KasserPro.Application.DTOs.CashRegister;

/// <summary>
/// DTO for cash register summary (daily/period)
/// </summary>
public class CashRegisterSummaryDto
{
    public decimal OpeningBalance { get; set; }
    public decimal ClosingBalance { get; set; }
    public decimal TotalDeposits { get; set; }
    public decimal TotalWithdrawals { get; set; }
    public decimal TotalSales { get; set; }
    public decimal TotalRefunds { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal TotalSupplierPayments { get; set; }
    public decimal TotalAdjustments { get; set; }
    public decimal TotalTransfersIn { get; set; }
    public decimal TotalTransfersOut { get; set; }
    public int TransactionCount { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
}
