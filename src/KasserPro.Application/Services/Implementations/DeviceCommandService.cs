using Microsoft.Extensions.Logging;
using KasserPro.Application.DTOs.Orders;
using KasserPro.Application.Services.Interfaces;

namespace KasserPro.Application.Services.Implementations;

/// <summary>
/// Service for sending commands to connected devices via SignalR
/// </summary>
public class DeviceCommandService : IDeviceCommandService
{
    private readonly ILogger<DeviceCommandService> _logger;

    public DeviceCommandService(ILogger<DeviceCommandService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Sends a print command to all connected devices
    /// Note: This is a placeholder for MVP. In production, inject IHubContext<DeviceHub>
    /// </summary>
    public Task<bool> SendPrintCommandAsync(PrintCommandDto command)
    {
        _logger.LogInformation("Print command {CommandId} queued for sending", command.CommandId);
        // In MVP, this will be called from OrderService after order completion
        // The actual sending happens via IHubContext<DeviceHub> in the API layer
        return Task.FromResult(true);
    }
}
