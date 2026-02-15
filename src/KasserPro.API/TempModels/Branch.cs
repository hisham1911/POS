using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class Branch
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public string Name { get; set; } = null!;

    public string Code { get; set; } = null!;

    public string? Address { get; set; }

    public string? Phone { get; set; }

    public int IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public string CurrencyCode { get; set; } = null!;

    public int DefaultTaxInclusive { get; set; }

    public decimal DefaultTaxRate { get; set; }

    public int IsWarehouse { get; set; }

    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    public virtual ICollection<BranchInventory> BranchInventories { get; set; } = new List<BranchInventory>();

    public virtual ICollection<BranchProductPrice> BranchProductPrices { get; set; } = new List<BranchProductPrice>();

    public virtual ICollection<CashRegisterTransaction> CashRegisterTransactions { get; set; } = new List<CashRegisterTransaction>();

    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

    public virtual ICollection<InventoryTransfer> InventoryTransferFromBranches { get; set; } = new List<InventoryTransfer>();

    public virtual ICollection<InventoryTransfer> InventoryTransferToBranches { get; set; } = new List<InventoryTransfer>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<PurchaseInvoice> PurchaseInvoices { get; set; } = new List<PurchaseInvoice>();

    public virtual ICollection<RefundLog> RefundLogs { get; set; } = new List<RefundLog>();

    public virtual ICollection<Shift> Shifts { get; set; } = new List<Shift>();

    public virtual ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();

    public virtual ICollection<Supplier> Suppliers { get; set; } = new List<Supplier>();

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
