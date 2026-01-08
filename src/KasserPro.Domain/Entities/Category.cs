namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class Category : BaseEntity
{
    public int TenantId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
