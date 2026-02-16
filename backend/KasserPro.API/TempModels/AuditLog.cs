using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class AuditLog
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public int? BranchId { get; set; }

    public int? UserId { get; set; }

    public string Action { get; set; } = null!;

    public string EntityType { get; set; } = null!;

    public int? EntityId { get; set; }

    public string? OldValues { get; set; }

    public string? NewValues { get; set; }

    public string? IpAddress { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public string? UserName { get; set; }

    public virtual Branch? Branch { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual User? User { get; set; }
}
