namespace KasserPro.BridgeApp.Models;

/// <summary>
/// Application settings stored in %AppData%\KasserPro\settings.json
/// </summary>
public class AppSettings
{
    /// <summary>
    /// Unique identifier for this device instance
    /// </summary>
    public string DeviceId { get; set; } = string.Empty;

    /// <summary>
    /// Backend API base URL (e.g., https://localhost:5243)
    /// </summary>
    public string BackendUrl { get; set; } = string.Empty;

    /// <summary>
    /// API key for authentication with backend
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Name of the default thermal printer
    /// </summary>
    public string DefaultPrinterName { get; set; } = string.Empty;

    /// <summary>
    /// Receipt customization settings
    /// </summary>
    public ReceiptSettings Receipt { get; set; } = new();
}

/// <summary>
/// Receipt printing customization settings
/// </summary>
public class ReceiptSettings
{
    /// <summary>
    /// Paper width in characters (default: 46)
    /// </summary>
    public int PaperWidthChars { get; set; } = 46;

    /// <summary>
    /// Font size for regular text (default: 8)
    /// </summary>
    public int RegularFontSize { get; set; } = 8;

    /// <summary>
    /// Font size for bold text (default: 9)
    /// </summary>
    public int BoldFontSize { get; set; } = 9;

    /// <summary>
    /// Font size for header (default: 11)
    /// </summary>
    public int HeaderFontSize { get; set; } = 11;

    /// <summary>
    /// Font size for totals (default: 10)
    /// </summary>
    public int TotalFontSize { get; set; } = 10;

    /// <summary>
    /// Font name (default: Arial)
    /// </summary>
    public string FontName { get; set; } = "Arial";

    /// <summary>
    /// Show branch name in header
    /// </summary>
    public bool ShowBranchName { get; set; } = true;

    /// <summary>
    /// Show barcode at bottom
    /// </summary>
    public bool ShowBarcode { get; set; } = true;

    /// <summary>
    /// Show thank you message
    /// </summary>
    public bool ShowThankYou { get; set; } = true;

    /// <summary>
    /// Line spacing multiplier (default: 1.0)
    /// </summary>
    public float LineSpacing { get; set; } = 1.0f;
}
