using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class User
{
    public int Id { get; set; }

    public int? BranchId { get; set; }

    public DateTime CreatedAt { get; set; }

    public string Email { get; set; } = null!;

    public int IsActive { get; set; }

    public int IsDeleted { get; set; }

    public string Name { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? Phone { get; set; }

    public string? PinCode { get; set; }

    public int Role { get; set; }

    public int? TenantId { get; set; }

    public string? UpdatedAt { get; set; }

    public string SecurityStamp { get; set; } = null!;

    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    public virtual Branch? Branch { get; set; }

    public virtual ICollection<CashRegisterTransaction> CashRegisterTransactions { get; set; } = new List<CashRegisterTransaction>();

    public virtual ICollection<Expense> ExpenseApprovedByUsers { get; set; } = new List<Expense>();

    public virtual ICollection<ExpenseAttachment> ExpenseAttachments { get; set; } = new List<ExpenseAttachment>();

    public virtual ICollection<Expense> ExpenseCreatedByUsers { get; set; } = new List<Expense>();

    public virtual ICollection<Expense> ExpensePaidByUsers { get; set; } = new List<Expense>();

    public virtual ICollection<Expense> ExpenseRejectedByUsers { get; set; } = new List<Expense>();

    public virtual ICollection<InventoryTransfer> InventoryTransferApprovedByUsers { get; set; } = new List<InventoryTransfer>();

    public virtual ICollection<InventoryTransfer> InventoryTransferCreatedByUsers { get; set; } = new List<InventoryTransfer>();

    public virtual ICollection<InventoryTransfer> InventoryTransferReceivedByUsers { get; set; } = new List<InventoryTransfer>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<PurchaseInvoice> PurchaseInvoiceConfirmedByUsers { get; set; } = new List<PurchaseInvoice>();

    public virtual ICollection<PurchaseInvoice> PurchaseInvoiceCreatedByUsers { get; set; } = new List<PurchaseInvoice>();

    public virtual ICollection<PurchaseInvoicePayment> PurchaseInvoicePayments { get; set; } = new List<PurchaseInvoicePayment>();

    public virtual ICollection<RefundLog> RefundLogs { get; set; } = new List<RefundLog>();

    public virtual ICollection<Shift> ShiftForceClosedByUsers { get; set; } = new List<Shift>();

    public virtual ICollection<Shift> ShiftHandedOverFromUsers { get; set; } = new List<Shift>();

    public virtual ICollection<Shift> ShiftHandedOverToUsers { get; set; } = new List<Shift>();

    public virtual ICollection<Shift> ShiftReconciledByUsers { get; set; } = new List<Shift>();

    public virtual ICollection<Shift> ShiftUserId1Navigations { get; set; } = new List<Shift>();

    public virtual ICollection<Shift> ShiftUsers { get; set; } = new List<Shift>();

    public virtual ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();

    public virtual Tenant? Tenant { get; set; }
}
