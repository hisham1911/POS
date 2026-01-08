namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class Branch : BaseEntity
{
    public int TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public decimal DefaultTaxRate { get; set; } = 14; // Egypt VAT 14%
    public bool DefaultTaxInclusive { get; set; } = true;
    public string CurrencyCode { get; set; } = "EGP";
    public bool IsActive { get; set; } = true;

    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Shift> Shifts { get; set; } = new List<Shift>();
    public ICollection<User> Users { get; set; } = new List<User>();
}
