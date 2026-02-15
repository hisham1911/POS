using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class RefundLog
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public int BranchId { get; set; }

    public int OrderId { get; set; }

    public int UserId { get; set; }

    public string RefundAmount { get; set; } = null!;

    public string Reason { get; set; } = null!;

    public string? StockChangesJson { get; set; }

    public string CreatedAt { get; set; } = null!;

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public virtual Branch Branch { get; set; } = null!;

    public virtual Order Order { get; set; } = null!;

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
