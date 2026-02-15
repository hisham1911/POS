using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class ExpenseCategory
{
    public int Id { get; set; }

    public int TenantId { get; set; }

    public string Name { get; set; } = null!;

    public string? NameEn { get; set; }

    public string? Description { get; set; }

    public string? Icon { get; set; }

    public string? Color { get; set; }

    public int IsActive { get; set; }

    public int IsSystem { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

    public virtual Tenant Tenant { get; set; } = null!;
}
