using KasserPro.BridgeApp.Models;

namespace KasserPro.BridgeApp.Services;

/// <summary>
/// Manages thermal printer operations
/// </summary>
public interface IPrinterService
{
    /// <summary>
    /// Initializes the printer service and detects available printers
    /// </summary>
    Task InitializeAsync();

    /// <summary>
    /// Gets list of all available printers on the system
    /// </summary>
    Task<List<string>> GetAvailablePrintersAsync();

    /// <summary>
    /// Prints a receipt on the configured thermal printer
    /// </summary>
    Task<bool> PrintReceiptAsync(ReceiptDto receipt);
}
