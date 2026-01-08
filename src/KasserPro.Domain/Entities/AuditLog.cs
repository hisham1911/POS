namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class AuditLog : BaseEntity
{
    public int TenantId { get; set; }
    public int? BranchId { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public int? EntityId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }

    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public Branch? Branch { get; set; }
    public User? User { get; set; }
}
