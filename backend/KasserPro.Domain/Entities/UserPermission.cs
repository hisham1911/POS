namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

/// <summary>
/// Links a specific permission to a user.
/// Each row = one active permission for one user.
/// </summary>
public class UserPermission : BaseEntity
{
    public int UserId { get; set; }
    public Permission Permission { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
