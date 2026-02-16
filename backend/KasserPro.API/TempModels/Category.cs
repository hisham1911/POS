using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class Category
{
    public int Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public int IsActive { get; set; }

    public int IsDeleted { get; set; }

    public string Name { get; set; } = null!;

    public string? NameEn { get; set; }

    public int SortOrder { get; set; }

    public int TenantId { get; set; }

    public string? UpdatedAt { get; set; }

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual Tenant Tenant { get; set; } = null!;
}
