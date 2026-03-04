namespace KasserPro.Domain.Enums;

/// <summary>
/// Defines the type of product for inventory and business logic handling
/// </summary>
public enum ProductType
{
    /// <summary>
    /// Physical product that requires inventory tracking
    /// </summary>
    Physical = 1,
    
    /// <summary>
    /// Service product that does not require inventory tracking
    /// </summary>
    Service = 2
}
