namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class Tenant : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string Currency { get; set; } = "EGP";
    public string Timezone { get; set; } = "Africa/Cairo";
    public bool IsActive { get; set; } = true;
    
    // Tax Settings - Dynamic per Tenant
    /// <summary>
    /// نسبة الضريبة الافتراضية للشركة (مثال: 14 = 14%)
    /// </summary>
    public decimal TaxRate { get; set; } = 14.0m;
    
    /// <summary>
    /// هل الضريبة مفعلة؟ إذا كانت false، لا يتم احتساب ضريبة
    /// </summary>
    public bool IsTaxEnabled { get; set; } = true;
    
    // Inventory Settings
    /// <summary>
    /// هل يُسمح بالمخزون السالب؟ إذا كانت false، لن يتم السماح بالبيع عند نفاذ المخزون
    /// </summary>
    public bool AllowNegativeStock { get; set; } = false;

    // Navigation
    public ICollection<Branch> Branches { get; set; } = new List<Branch>();
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
