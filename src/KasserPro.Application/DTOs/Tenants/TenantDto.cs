namespace KasserPro.Application.DTOs.Tenants;

public class TenantDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string Currency { get; set; } = "EGP";
    public string Timezone { get; set; } = "Africa/Cairo";
    public bool IsActive { get; set; }
    
    // Tax Settings
    /// <summary>
    /// نسبة الضريبة (مثال: 14 = 14%)
    /// </summary>
    public decimal TaxRate { get; set; } = 14.0m;
    
    /// <summary>
    /// هل الضريبة مفعلة؟
    /// </summary>
    public bool IsTaxEnabled { get; set; } = true;
    
    /// <summary>
    /// هل يُسمح بالمخزون السالب؟
    /// </summary>
    public bool AllowNegativeStock { get; set; } = false;
    
    public DateTime CreatedAt { get; set; }
}

public class UpdateTenantDto
{
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? LogoUrl { get; set; }
    public string Currency { get; set; } = "EGP";
    public string Timezone { get; set; } = "Africa/Cairo";
    
    // Tax Settings
    /// <summary>
    /// نسبة الضريبة (0-100)
    /// </summary>
    public decimal? TaxRate { get; set; }
    
    /// <summary>
    /// هل الضريبة مفعلة؟
    /// </summary>
    public bool? IsTaxEnabled { get; set; }
    
    /// <summary>
    /// هل يُسمح بالمخزون السالب؟
    /// </summary>
    public bool? AllowNegativeStock { get; set; }
}
