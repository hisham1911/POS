namespace KasserPro.Domain.Enums;

/// <summary>
/// Represents the type of order in the POS system.
/// Stored as integer in database for performance.
/// </summary>
public enum OrderType
{
    /// <summary>Dine-in order (تناول في المكان)</summary>
    DineIn = 0,
    
    /// <summary>Takeaway order (تيك أواي)</summary>
    Takeaway = 1,
    
    /// <summary>Delivery order (توصيل)</summary>
    Delivery = 2
}
