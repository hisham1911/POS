using KasserPro.BridgeApp.Models;

namespace KasserPro.BridgeApp.Services;

/// <summary>
/// Manages application settings persistence
/// </summary>
public interface ISettingsManager
{
    /// <summary>
    /// Loads settings from disk or creates defaults
    /// </summary>
    Task<AppSettings> GetSettingsAsync();

    /// <summary>
    /// Saves settings to disk
    /// </summary>
    Task SaveSettingsAsync(AppSettings settings);
}
