using KasserPro.Application.DTOs.Orders;

namespace KasserPro.Application.Services.Interfaces;

/// <summary>
/// Service for sending commands to connected devices via SignalR
/// </summary>
public interface IDeviceCommandService
{
    /// <summary>
    /// Sends a print command to all connected devices
    /// </summary>
    Task<bool> SendPrintCommandAsync(PrintCommandDto command);
}
