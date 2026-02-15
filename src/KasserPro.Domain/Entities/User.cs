namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

public class User : BaseEntity
{
    public int? TenantId { get; set; }
    public int? BranchId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public UserRole Role { get; set; } = UserRole.Cashier;
    public bool IsActive { get; set; } = true;
    public string? PinCode { get; set; }
    public string SecurityStamp { get; set; } = Guid.NewGuid().ToString();

    // Navigation
    public Tenant? Tenant { get; set; }
    public Branch? Branch { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Shift> Shifts { get; set; } = new List<Shift>();

    /// <summary>
    /// Updates the security stamp to invalidate existing JWTs
    /// </summary>
    public void UpdateSecurityStamp()
    {
        SecurityStamp = Guid.NewGuid().ToString();
    }
}
