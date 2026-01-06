namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public OrderStatus Status { get; set; } = OrderStatus.Draft;

    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal TaxRate { get; set; } = 15;
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }

    public decimal AmountPaid { get; set; } = 0;
    public decimal ChangeAmount { get; set; } = 0;

    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? Notes { get; set; }

    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    public int UserId { get; set; }
    public int? ShiftId { get; set; }

    public User User { get; set; } = null!;
    public Shift? Shift { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
