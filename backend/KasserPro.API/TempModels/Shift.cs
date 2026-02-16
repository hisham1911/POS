using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class Shift
{
    public int Id { get; set; }

    public int BranchId { get; set; }

    public DateTime? ClosedAt { get; set; }

    public decimal ClosingBalance { get; set; }

    public DateTime CreatedAt { get; set; }

    public int Difference { get; set; }

    public decimal ExpectedBalance { get; set; }

    public string? ForceCloseReason { get; set; }

    public string? ForceClosedAt { get; set; }

    public int? ForceClosedByUserId { get; set; }

    public string? ForceClosedByUserName { get; set; }

    public string? HandedOverAt { get; set; }

    public int? HandedOverFromUserId { get; set; }

    public string? HandedOverFromUserName { get; set; }

    public int? HandedOverToUserId { get; set; }

    public string? HandedOverToUserName { get; set; }

    public int HandoverBalance { get; set; }

    public string? HandoverNotes { get; set; }

    public int IsClosed { get; set; }

    public int IsDeleted { get; set; }

    public int IsForceClosed { get; set; }

    public int IsHandedOver { get; set; }

    public int IsReconciled { get; set; }

    public DateTime LastActivityAt { get; set; }

    public string? Notes { get; set; }

    public DateTime OpenedAt { get; set; }

    public int OpeningBalance { get; set; }

    public string? ReconciledAt { get; set; }

    public int? ReconciledByUserId { get; set; }

    public string? ReconciledByUserName { get; set; }

    public byte[] RowVersion { get; set; } = null!;

    public int TenantId { get; set; }

    public decimal TotalCard { get; set; }

    public decimal TotalCash { get; set; }

    public int TotalOrders { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int UserId { get; set; }

    public int? UserId1 { get; set; }

    public string? VarianceReason { get; set; }

    public virtual Branch Branch { get; set; } = null!;

    public virtual ICollection<CashRegisterTransaction> CashRegisterTransactions { get; set; } = new List<CashRegisterTransaction>();

    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

    public virtual User? ForceClosedByUser { get; set; }

    public virtual User? HandedOverFromUser { get; set; }

    public virtual User? HandedOverToUser { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual User? ReconciledByUser { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual User User { get; set; } = null!;

    public virtual User? UserId1Navigation { get; set; }
}
