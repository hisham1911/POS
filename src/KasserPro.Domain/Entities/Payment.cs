namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

public class Payment : BaseEntity
{
    public PaymentMethod Method { get; set; }
    public decimal Amount { get; set; }
    public string? Reference { get; set; }

    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
}
