using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class CashRegisterTransaction
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public int BranchId { get; set; }

    public string TransactionNumber { get; set; } = null!;

    public string Type { get; set; } = null!;

    public decimal Amount { get; set; }

    public decimal BalanceBefore { get; set; }

    public decimal BalanceAfter { get; set; }

    public string TransactionDate { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string? ReferenceType { get; set; }

    public int? ReferenceId { get; set; }

    public int? ShiftId { get; set; }

    public int? TransferReferenceId { get; set; }

    public int UserId { get; set; }

    public string UserName { get; set; } = null!;

    public string CreatedAt { get; set; } = null!;

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public virtual Branch Branch { get; set; } = null!;

    public virtual Shift? Shift { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
