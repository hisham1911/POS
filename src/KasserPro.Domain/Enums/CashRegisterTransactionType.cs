namespace KasserPro.Domain.Enums;

/// <summary>
/// Types of cash register transactions for tracking cash flow
/// </summary>
public enum CashRegisterTransactionType
{
    /// <summary>
    /// Opening balance when shift starts
    /// </summary>
    Opening = 0,
    
    /// <summary>
    /// Cash deposit into register
    /// </summary>
    Deposit = 1,
    
    /// <summary>
    /// Cash withdrawal from register
    /// </summary>
    Withdrawal = 2,
    
    /// <summary>
    /// Cash received from order sale
    /// </summary>
    Sale = 3,
    
    /// <summary>
    /// Cash refunded to customer
    /// </summary>
    Refund = 4,
    
    /// <summary>
    /// Cash paid for expense
    /// </summary>
    Expense = 5,
    
    /// <summary>
    /// Cash paid to supplier
    /// </summary>
    SupplierPayment = 6,
    
    /// <summary>
    /// Manual adjustment for reconciliation
    /// </summary>
    Adjustment = 7,
    
    /// <summary>
    /// Cash transfer between branches
    /// </summary>
    Transfer = 8
}
