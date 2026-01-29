namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

/// <summary>
/// Expense category for organizing and analyzing expenses
/// </summary>
public class ExpenseCategory : BaseEntity
{
    public int TenantId { get; set; }
    
    /// <summary>
    /// Category name in Arabic
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Category name in English (optional)
    /// </summary>
    public string? NameEn { get; set; }
    
    /// <summary>
    /// Category description
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// Icon name for UI display (e.g., "receipt", "salary", "utilities")
    /// </summary>
    public string? Icon { get; set; }
    
    /// <summary>
    /// Color code for UI display (e.g., "#FF5733")
    /// </summary>
    public string? Color { get; set; }
    
    /// <summary>
    /// Whether this category is active and can be used
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Whether this is a system-defined category (cannot be deleted)
    /// </summary>
    public bool IsSystem { get; set; } = false;
    
    /// <summary>
    /// Display order for sorting categories
    /// </summary>
    public int SortOrder { get; set; } = 0;
    
    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
