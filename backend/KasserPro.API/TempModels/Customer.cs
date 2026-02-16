using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class Customer
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public string Phone { get; set; } = null!;

    public string? Name { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }

    public string? Notes { get; set; }

    public int LoyaltyPoints { get; set; }

    public int TotalOrders { get; set; }

    public decimal TotalSpent { get; set; }

    public DateTime? LastOrderAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public int IsActive { get; set; }

    public decimal CreditLimit { get; set; }

    public decimal TotalDue { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual Tenant Tenant { get; set; } = null!;
}
