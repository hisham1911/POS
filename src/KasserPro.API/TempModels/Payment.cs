using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class Payment
{
    public int Id { get; set; }

    public decimal Amount { get; set; }

    public int BranchId { get; set; }

    public DateTime CreatedAt { get; set; }

    public int IsDeleted { get; set; }

    public int Method { get; set; }

    public int OrderId { get; set; }

    public string? Reference { get; set; }

    public int TenantId { get; set; }

    public string? UpdatedAt { get; set; }

    public virtual Branch Branch { get; set; } = null!;

    public virtual Order Order { get; set; } = null!;

    public virtual Tenant Tenant { get; set; } = null!;
}
