using System.Text.Json.Serialization;

namespace KasserPro.BridgeApp.Models;

/// <summary>
/// Print command received from backend via SignalR
/// </summary>
public class PrintCommandDto
{
    [JsonPropertyName("commandId")]
    public string CommandId { get; set; } = string.Empty;
    [JsonPropertyName("receipt")]
    public ReceiptDto Receipt { get; set; } = new();
    [JsonPropertyName("settings")]
    public ReceiptPrintSettings Settings { get; set; } = new();
}

/// <summary>
/// Receipt print settings received from server (tenant configuration)
/// </summary>
public class ReceiptPrintSettings
{
    [JsonPropertyName("paperSize")]
    public string PaperSize { get; set; } = "80mm";
    [JsonPropertyName("customWidth")]
    public int? CustomWidth { get; set; }
    [JsonPropertyName("headerFontSize")]
    public int HeaderFontSize { get; set; } = 12;
    [JsonPropertyName("bodyFontSize")]
    public int BodyFontSize { get; set; } = 9;
    [JsonPropertyName("totalFontSize")]
    public int TotalFontSize { get; set; } = 11;
    [JsonPropertyName("showBranchName")]
    public bool ShowBranchName { get; set; } = true;
    [JsonPropertyName("showCashier")]
    public bool ShowCashier { get; set; } = true;
    [JsonPropertyName("showThankYou")]
    public bool ShowThankYou { get; set; } = true;
    [JsonPropertyName("showCustomerName")]
    public bool ShowCustomerName { get; set; } = true;
    [JsonPropertyName("showLogo")]
    public bool ShowLogo { get; set; } = true;
    [JsonPropertyName("footerMessage")]
    public string? FooterMessage { get; set; }
    [JsonPropertyName("phoneNumber")]
    public string? PhoneNumber { get; set; }
    [JsonPropertyName("logoUrl")]
    public string? LogoUrl { get; set; }
    [JsonPropertyName("taxRate")]
    public decimal TaxRate { get; set; } = 14;
    [JsonPropertyName("isTaxEnabled")]
    public bool IsTaxEnabled { get; set; } = true;
}

/// <summary>
/// Print completion event sent back to backend
/// </summary>
public class PrintCompletedEventDto
{
    public string CommandId { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CompletedAt { get; set; }
}
