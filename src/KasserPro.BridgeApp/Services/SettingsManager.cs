using System.IO;
using System.Text.Json;
using KasserPro.BridgeApp.Models;
using Serilog;

namespace KasserPro.BridgeApp.Services;

/// <summary>
/// Manages application settings stored in %AppData%\KasserPro\settings.json
/// </summary>
public class SettingsManager : ISettingsManager
{
    private readonly string _settingsFilePath;
    private AppSettings? _cachedSettings;

    public SettingsManager()
    {
        var appDataPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "KasserPro"
        );
        Directory.CreateDirectory(appDataPath);
        _settingsFilePath = Path.Combine(appDataPath, "settings.json");
    }

    /// <summary>
    /// Loads settings from disk or creates defaults if file doesn't exist
    /// </summary>
    public async Task<AppSettings> GetSettingsAsync()
    {
        if (_cachedSettings != null)
            return _cachedSettings;

        if (!File.Exists(_settingsFilePath))
        {
            Log.Information("Settings file not found, creating defaults");
            _cachedSettings = CreateDefaultSettings();
            await SaveSettingsAsync(_cachedSettings);
            return _cachedSettings;
        }

        try
        {
            var json = await File.ReadAllTextAsync(_settingsFilePath);
            _cachedSettings = JsonSerializer.Deserialize<AppSettings>(json) ?? CreateDefaultSettings();
            Log.Information("Settings loaded from {Path}", _settingsFilePath);
            return _cachedSettings;
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Failed to load settings, using defaults");
            _cachedSettings = CreateDefaultSettings();
            return _cachedSettings;
        }
    }

    /// <summary>
    /// Saves settings to disk as JSON
    /// </summary>
    public async Task SaveSettingsAsync(AppSettings settings)
    {
        try
        {
            var json = JsonSerializer.Serialize(settings, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            await File.WriteAllTextAsync(_settingsFilePath, json);
            _cachedSettings = settings;
            Log.Information("Settings saved to {Path}", _settingsFilePath);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Failed to save settings");
            throw;
        }
    }

    /// <summary>
    /// Creates default settings with a new unique DeviceId
    /// </summary>
    private AppSettings CreateDefaultSettings()
    {
        var settings = new AppSettings
        {
            DeviceId = Guid.NewGuid().ToString(),
            BackendUrl = "https://localhost:5243",
            ApiKey = "",
            DefaultPrinterName = ""
        };

        // Try to get first available printer as default
        try
        {
            var printers = System.Drawing.Printing.PrinterSettings.InstalledPrinters;
            if (printers.Count > 0)
            {
                settings.DefaultPrinterName = printers[0];
                Log.Information($"Default printer set to: {printers[0]}");
            }
            else
            {
                Log.Warning("No printers found on system");
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error getting default printer");
        }

        return settings;
    }
}
