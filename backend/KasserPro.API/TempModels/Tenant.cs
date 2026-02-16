using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class Tenant
{
    public int Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public string Currency { get; set; } = null!;

    public int IsActive { get; set; }

    public int IsDeleted { get; set; }

    public int IsTaxEnabled { get; set; }

    public string? LogoUrl { get; set; }

    public string Name { get; set; } = null!;

    public string? NameEn { get; set; }

    public string Slug { get; set; } = null!;

    public decimal TaxRate { get; set; }

    public string Timezone { get; set; } = null!;

    public string? UpdatedAt { get; set; }

    public int AllowNegativeStock { get; set; }

    public int ReceiptBodyFontSize { get; set; }

    public string? ReceiptFooterMessage { get; set; }

    public int ReceiptHeaderFontSize { get; set; }

    public string ReceiptPaperSize { get; set; } = null!;

    public string? ReceiptPhoneNumber { get; set; }

    public int ReceiptShowBranchName { get; set; }

    public int ReceiptShowCashier { get; set; }

    public int ReceiptShowThankYou { get; set; }

    public int ReceiptTotalFontSize { get; set; }

    public int? ReceiptCustomWidth { get; set; }

    public int ReceiptShowCustomerName { get; set; }

    public int ReceiptShowLogo { get; set; }

    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    public virtual ICollection<BranchInventory> BranchInventories { get; set; } = new List<BranchInventory>();

    public virtual ICollection<BranchProductPrice> BranchProductPrices { get; set; } = new List<BranchProductPrice>();

    public virtual ICollection<Branch> Branches { get; set; } = new List<Branch>();

    public virtual ICollection<CashRegisterTransaction> CashRegisterTransactions { get; set; } = new List<CashRegisterTransaction>();

    public virtual ICollection<Category> Categories { get; set; } = new List<Category>();

    public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();

    public virtual ICollection<ExpenseCategory> ExpenseCategories { get; set; } = new List<ExpenseCategory>();

    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

    public virtual ICollection<InventoryTransfer> InventoryTransfers { get; set; } = new List<InventoryTransfer>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<Product> Products { get; set; } = new List<Product>();

    public virtual ICollection<PurchaseInvoice> PurchaseInvoices { get; set; } = new List<PurchaseInvoice>();

    public virtual ICollection<RefundLog> RefundLogs { get; set; } = new List<RefundLog>();

    public virtual ICollection<Shift> Shifts { get; set; } = new List<Shift>();

    public virtual ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();

    public virtual ICollection<Supplier> Suppliers { get; set; } = new List<Supplier>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
