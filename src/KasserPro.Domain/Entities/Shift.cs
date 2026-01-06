namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class Shift : BaseEntity
{
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
    public User User { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
