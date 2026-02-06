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
}
