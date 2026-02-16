namespace KasserPro.Domain.Enums;

/// <summary>
/// Represents the status of a purchase invoice
/// </summary>
public enum PurchaseInvoiceStatus
{
    /// <summary>
    /// Invoice is being created - can be edited/deleted freely
    /// </summary>
    Draft = 0,
    
    /// <summary>
    /// Invoice confirmed by Admin - inventory updated, cannot edit directly
    /// </summary>
    Confirmed = 1,
    
    /// <summary>
    /// Invoice fully paid
    /// </summary>
    Paid = 2,
    
    /// <summary>
    /// Invoice partially paid
    /// </summary>
    PartiallyPaid = 3,
    
    /// <summary>
    /// Invoice cancelled - may or may not adjust inventory
    /// </summary>
    Cancelled = 4,
    
    /// <summary>
    /// Invoice returned (full return)
    /// </summary>
    Returned = 5,
    
    /// <summary>
    /// Invoice partially returned
    /// </summary>
    PartiallyReturned = 6
}
