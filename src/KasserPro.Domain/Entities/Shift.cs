namespace KasserPro.Domain.Entities;

using System.ComponentModel.DataAnnotations;
using KasserPro.Domain.Common;

public class Shift : BaseEntity
{
    public int TenantId { get; set; }
    public int BranchId { get; set; }
    
    public decimal OpeningBalance { get; set; }
    public decimal ClosingBalance { get; set; }
    public decimal ExpectedBalance { get; set; }
    public decimal Difference { get; set; }

    public DateTime OpenedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public bool IsClosed { get; set; } = false;

    public string? Notes { get; set; }

    public decimal TotalCash { get; set; }
    public decimal TotalCard { get; set; }
    public int TotalOrders { get; set; }

    public int UserId { get; set; }
    
    /// <summary>
    /// Concurrency token for optimistic locking.
    /// Prevents race conditions when multiple requests try to close the same shift.
    /// </summary>
    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    
    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
