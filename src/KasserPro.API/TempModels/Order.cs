using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class Order
{
    public int Id { get; set; }

    public decimal AmountDue { get; set; }

    public decimal AmountPaid { get; set; }

    public string? BranchAddress { get; set; }

    public int BranchId { get; set; }

    public string? BranchName { get; set; }

    public string? BranchPhone { get; set; }

    public string? CancellationReason { get; set; }

    public string? CancelledAt { get; set; }

    public decimal ChangeAmount { get; set; }

    public DateTime? CompletedAt { get; set; }

    public int? CompletedByUserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public string CurrencyCode { get; set; } = null!;

    public int? CustomerId { get; set; }

    public string? CustomerName { get; set; }

    public string? CustomerPhone { get; set; }

    public decimal DiscountAmount { get; set; }

    public string? DiscountCode { get; set; }

    public int? DiscountId { get; set; }

    public string? DiscountType { get; set; }

    public string? DiscountValue { get; set; }

    public int IsDeleted { get; set; }

    public string? Notes { get; set; }

    public string OrderNumber { get; set; } = null!;

    public int OrderType { get; set; }

    public decimal RefundAmount { get; set; }

    public string? RefundReason { get; set; }

    public string? RefundedAt { get; set; }

    public int? RefundedByUserId { get; set; }

    public string? RefundedByUserName { get; set; }

    public decimal ServiceChargeAmount { get; set; }

    public decimal ServiceChargePercent { get; set; }

    public int? ShiftId { get; set; }

    public int Status { get; set; }

    public decimal Subtotal { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal TaxRate { get; set; }

    public int TenantId { get; set; }

    public decimal Total { get; set; }

    public string? UpdatedAt { get; set; }

    public int UserId { get; set; }

    public string? UserName { get; set; }

    public virtual Branch Branch { get; set; } = null!;

    public virtual Customer? Customer { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual RefundLog? RefundLog { get; set; }

    public virtual Shift? Shift { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
