namespace KasserPro.Domain.Enums;

/// <summary>
/// Status of an expense in its lifecycle
/// </summary>
public enum ExpenseStatus
{
    /// <summary>
    /// Draft - Can be edited or deleted
    /// </summary>
    Draft = 0,
    
    /// <summary>
    /// Approved by admin - Ready for payment
    /// </summary>
    Approved = 1,
    
    /// <summary>
    /// Paid - Payment completed
    /// </summary>
    Paid = 2,
    
    /// <summary>
    /// Rejected by admin - Cannot be paid
    /// </summary>
    Rejected = 3
}
