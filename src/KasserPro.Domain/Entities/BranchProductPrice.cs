namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

/// <summary>
/// Represents branch-specific pricing for a product.
/// Allows different branches to have different prices for the same product.
/// If no branch price exists, the Product.Price (default) is used.
/// </summary>
public class BranchProductPrice : BaseEntity
{
    /// <summary>
    /// Tenant ID for multi-tenancy
    /// </summary>
    public int TenantId { get; set; }
    
    /// <summary>
    /// Branch ID - which branch this price applies to
    /// </summary>
    public int BranchId { get; set; }
    
    /// <summary>
    /// Product ID - which product this price is for
    /// </summary>
    public int ProductId { get; set; }
    
    /// <summary>
    /// Branch-specific price (overrides Product.Price)
    /// </summary>
    public decimal Price { get; set; }
    
    /// <summary>
    /// When this price becomes effective
    /// Allows scheduling future price changes
    /// </summary>
    public DateTime EffectiveFrom { get; set; }
    
    /// <summary>
    /// Optional: When this price expires (null = no expiry)
    /// </summary>
    public DateTime? EffectiveTo { get; set; }
    
    /// <summary>
    /// Whether this price is currently active
    /// </summary>
    public bool IsActive { get; set; }
    
    // Navigation Properties
    public Tenant Tenant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
