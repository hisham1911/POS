namespace KasserPro.Domain.Enums;

/// <summary>
/// Payment methods supported by the system
/// </summary>
public enum PaymentMethod
{
    /// <summary>
    /// Cash payment - affects cash register
    /// </summary>
    Cash = 0,
    
    /// <summary>
    /// Card payment (Credit/Debit) - does not affect cash register
    /// </summary>
    Card = 1,
    
    /// <summary>
    /// Fawry payment - does not affect cash register
    /// </summary>
    Fawry = 2,
    
    /// <summary>
    /// Bank transfer - does not affect cash register
    /// </summary>
    BankTransfer = 3
}
