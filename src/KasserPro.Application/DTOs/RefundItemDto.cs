namespace KasserPro.Application.DTOs;

/// <summary>
/// DTO for a single item in a partial refund request
/// </summary>
public class RefundItemDto
{
    /// <summary>
    /// The order item ID to refund
    /// </summary>
    public int ItemId { get; set; }
    
    /// <summary>
    /// Quantity to refund (must be <= original quantity)
    /// </summary>
    public int Quantity { get; set; }
    
    /// <summary>
    /// Reason for refunding this specific item (optional)
    /// </summary>
    public string? Reason { get; set; }
}
