using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class InventoryTransfer
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public string TransferNumber { get; set; } = null!;

    public int FromBranchId { get; set; }

    public int ToBranchId { get; set; }

    public int ProductId { get; set; }

    public string ProductName { get; set; } = null!;

    public string? ProductSku { get; set; }

    public int Quantity { get; set; }

    public string Status { get; set; } = null!;

    public string Reason { get; set; } = null!;

    public string? Notes { get; set; }

    public int CreatedByUserId { get; set; }

    public string CreatedByUserName { get; set; } = null!;

    public int? ApprovedByUserId { get; set; }

    public string? ApprovedByUserName { get; set; }

    public string? ApprovedAt { get; set; }

    public int? ReceivedByUserId { get; set; }

    public string? ReceivedByUserName { get; set; }

    public string? ReceivedAt { get; set; }

    public int? CancelledByUserId { get; set; }

    public string? CancelledByUserName { get; set; }

    public string? CancelledAt { get; set; }

    public string? CancellationReason { get; set; }

    public string CreatedAt { get; set; } = null!;

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public virtual User? ApprovedByUser { get; set; }

    public virtual User CreatedByUser { get; set; } = null!;

    public virtual Branch FromBranch { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;

    public virtual User? ReceivedByUser { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual Branch ToBranch { get; set; } = null!;
}
