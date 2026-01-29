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
    
    // Cash Register Reconciliation
    /// <summary>
    /// Whether cash register has been reconciled for this shift
    /// </summary>
    public bool IsReconciled { get; set; } = false;
    
    /// <summary>
    /// User who reconciled the cash register
    /// </summary>
    public int? ReconciledByUserId { get; set; }
    public string? ReconciledByUserName { get; set; }
    
    /// <summary>
    /// When the cash register was reconciled
    /// </summary>
    public DateTime? ReconciledAt { get; set; }
    
    /// <summary>
    /// Reason for variance (if any) during reconciliation
    /// </summary>
    public string? VarianceReason { get; set; }
    
    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public User User { get; set; } = null!;
    public User? ReconciledByUser { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<CashRegisterTransaction> CashRegisterTransactions { get; set; } = new List<CashRegisterTransaction>();
}
