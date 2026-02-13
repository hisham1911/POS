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

    // Receipt Settings
    public string ReceiptPaperSize { get; set; } = "80mm";
    public int? ReceiptCustomWidth { get; set; }
    public int ReceiptHeaderFontSize { get; set; } = 12;
    public int ReceiptBodyFontSize { get; set; } = 9;
    public int ReceiptTotalFontSize { get; set; } = 11;
    public bool ReceiptShowBranchName { get; set; } = true;
    public bool ReceiptShowCashier { get; set; } = true;
    public bool ReceiptShowThankYou { get; set; } = true;
    public string? ReceiptFooterMessage { get; set; }
    public string? ReceiptPhoneNumber { get; set; }
    public bool ReceiptShowCustomerName { get; set; } = true;
    public bool ReceiptShowLogo { get; set; } = true;

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

    // Receipt Settings
    public string? ReceiptPaperSize { get; set; }
    public int? ReceiptCustomWidth { get; set; }
    public int? ReceiptHeaderFontSize { get; set; }
    public int? ReceiptBodyFontSize { get; set; }
    public int? ReceiptTotalFontSize { get; set; }
    public bool? ReceiptShowBranchName { get; set; }
    public bool? ReceiptShowCashier { get; set; }
    public bool? ReceiptShowThankYou { get; set; }
    public string? ReceiptFooterMessage { get; set; }
    public string? ReceiptPhoneNumber { get; set; }
    public bool? ReceiptShowCustomerName { get; set; }
    public bool? ReceiptShowLogo { get; set; }
}
