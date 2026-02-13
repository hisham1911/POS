namespace KasserPro.Domain.Enums;

/// <summary>
/// Status of an inventory transfer between branches
/// </summary>
public enum InventoryTransferStatus
{
    /// <summary>
    /// Transfer created, waiting for approval
    /// </summary>
    Pending = 0,
    
    /// <summary>
    /// Transfer approved by Admin, inventory deducted from source
    /// </summary>
    Approved = 1,
    
    /// <summary>
    /// Transfer received at destination, inventory added
    /// </summary>
    Completed = 2,
    
    /// <summary>
    /// Transfer cancelled
    /// </summary>
    Cancelled = 3
}
