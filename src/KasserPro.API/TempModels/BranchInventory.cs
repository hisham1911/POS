using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class BranchInventory
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public int BranchId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public int ReorderLevel { get; set; }

    public string LastUpdatedAt { get; set; } = null!;

    public string CreatedAt { get; set; } = null!;

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public virtual Branch Branch { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;

    public virtual Tenant Tenant { get; set; } = null!;
}
