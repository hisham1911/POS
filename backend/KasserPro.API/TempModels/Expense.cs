using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class Expense
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public int BranchId { get; set; }

    public string ExpenseNumber { get; set; } = null!;

    public int CategoryId { get; set; }

    public int Amount { get; set; }

    public DateTime ExpenseDate { get; set; }

    public string Description { get; set; } = null!;

    public string? Beneficiary { get; set; }

    public string? ReferenceNumber { get; set; }

    public string? Notes { get; set; }

    public string Status { get; set; } = null!;

    public int? ShiftId { get; set; }

    public string? PaymentMethod { get; set; }

    public DateTime? PaymentDate { get; set; }

    public string? PaymentReferenceNumber { get; set; }

    public int CreatedByUserId { get; set; }

    public string CreatedByUserName { get; set; } = null!;

    public int? ApprovedByUserId { get; set; }

    public string? ApprovedByUserName { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public int? PaidByUserId { get; set; }

    public string? PaidByUserName { get; set; }

    public DateTime? PaidAt { get; set; }

    public int? RejectedByUserId { get; set; }

    public string? RejectedByUserName { get; set; }

    public string? RejectedAt { get; set; }

    public string? RejectionReason { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public virtual User? ApprovedByUser { get; set; }

    public virtual Branch Branch { get; set; } = null!;

    public virtual ExpenseCategory Category { get; set; } = null!;

    public virtual User CreatedByUser { get; set; } = null!;

    public virtual ICollection<ExpenseAttachment> ExpenseAttachments { get; set; } = new List<ExpenseAttachment>();

    public virtual User? PaidByUser { get; set; }

    public virtual User? RejectedByUser { get; set; }

    public virtual Shift? Shift { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;
}
