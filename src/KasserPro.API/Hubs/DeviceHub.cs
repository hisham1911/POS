using Microsoft.AspNetCore.SignalR;

namespace KasserPro.API.Hubs;

/// <summary>
/// SignalR hub for communication with Desktop Bridge App devices
/// </summary>
public class DeviceHub : Hub
{
    private readonly ILogger<DeviceHub> _logger;
    private static readonly Dictionary<string, string> _deviceConnections = new();

    public DeviceHub(ILogger<DeviceHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Called when a device connects to the hub
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        if (httpContext == null)
        {
            _logger.LogWarning("No HTTP context available");
            Context.Abort();
            return;
        }

        var deviceId = httpContext.Request.Headers["X-Device-Id"].ToString();
        var apiKey = httpContext.Request.Headers["X-API-Key"].ToString();

        // Validate API key (simplified for MVP - in production, validate against database)
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("Device connection rejected: No API key provided");
            Context.Abort();
            return;
        }

        if (string.IsNullOrEmpty(deviceId))
        {
            _logger.LogWarning("Device connection rejected: No Device ID provided");
            Context.Abort();
            return;
        }

        // Store device connection
        lock (_deviceConnections)
        {
            _deviceConnections[deviceId] = Context.ConnectionId;
        }

        // P0-5: Add device to a branch group for targeted receipt delivery.
        // Branch ID comes from the X-Branch-Id header (set by desktop bridge config).
        // Default to "branch-default" if not provided.
        var branchId = httpContext.Request.Headers["X-Branch-Id"].ToString();
        var groupName = !string.IsNullOrEmpty(branchId) ? $"branch-{branchId}" : "branch-default";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        _logger.LogInformation("Device {DeviceId} connected with connection ID {ConnectionId} and added to group {GroupName}", 
            deviceId, Context.ConnectionId, groupName);

        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Called when a device disconnects from the hub
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var httpContext = Context.GetHttpContext();
        if (httpContext != null)
        {
            var deviceId = httpContext.Request.Headers["X-Device-Id"].ToString();
            
            if (!string.IsNullOrEmpty(deviceId))
            {
                lock (_deviceConnections)
                {
                    _deviceConnections.Remove(deviceId);
                }

                _logger.LogInformation("Device {DeviceId} disconnected", deviceId);
            }
        }

        if (exception != null)
        {
            _logger.LogError(exception, "Device disconnected with error");
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Called by Desktop App to report print completion
    /// </summary>
    /// <param name="eventDto">Print completion event data</param>
    public async Task PrintCompleted(PrintCompletedEventDto eventDto)
    {
        _logger.LogInformation(
            "Print completed: CommandId={CommandId}, Success={Success}, Error={Error}", 
            eventDto.CommandId, 
            eventDto.Success,
            eventDto.ErrorMessage ?? "None"
        );

        // P0-5: Notify the caller that print is complete (no need to broadcast status)
        await Clients.Caller.SendAsync("PrintCompleted", eventDto);
    }

    /// <summary>
    /// Gets count of currently connected devices
    /// </summary>
    public static int GetConnectedDeviceCount()
    {
        lock (_deviceConnections)
        {
            return _deviceConnections.Count;
        }
    }
}

/// <summary>
/// Print completion event DTO
/// </summary>
public class PrintCompletedEventDto
{
    public string CommandId { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CompletedAt { get; set; }
}
