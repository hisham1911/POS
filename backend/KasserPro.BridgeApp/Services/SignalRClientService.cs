using Microsoft.AspNetCore.SignalR.Client;
using KasserPro.BridgeApp.Models;
using Serilog;

namespace KasserPro.BridgeApp.Services;

/// <summary>
/// Manages SignalR connection to backend Device Hub
/// </summary>
public class SignalRClientService : ISignalRClientService
{
    private HubConnection? _hubConnection;
    private readonly ISettingsManager _settingsManager;

    public event EventHandler<PrintCommandEventArgs>? OnPrintCommandReceived;
    public event EventHandler<ConnectionStateChangedEventArgs>? OnConnectionStateChanged;

    public bool IsConnected => _hubConnection?.State == HubConnectionState.Connected;

    public SignalRClientService(ISettingsManager settingsManager)
    {
        _settingsManager = settingsManager;
    }

    /// <summary>
    /// Establishes SignalR connection to backend Device Hub
    /// </summary>
    public async Task<bool> ConnectAsync()
    {
        try
        {
            var settings = await _settingsManager.GetSettingsAsync();

            if (string.IsNullOrEmpty(settings.BackendUrl))
            {
                Log.Error("Backend URL not configured");
                return false;
            }

            if (string.IsNullOrEmpty(settings.ApiKey))
            {
                Log.Error("API Key not configured");
                return false;
            }

            Log.Information("Connecting to Device Hub at {Url}", settings.BackendUrl);

            _hubConnection = new HubConnectionBuilder()
                .WithUrl($"{settings.BackendUrl}/hubs/devices", options =>
                {
                    options.Headers.Add("X-API-Key", settings.ApiKey);
                    options.Headers.Add("X-Device-Id", settings.DeviceId);
                    options.Headers.Add("X-Branch-Id", settings.BranchId ?? "default");
                })
                .WithAutomaticReconnect(new[] { TimeSpan.Zero, TimeSpan.FromSeconds(2), TimeSpan.FromSeconds(5), TimeSpan.FromSeconds(10) })
                .Build();

            RegisterHandlers();

            await _hubConnection.StartAsync();
            Log.Information("Connected to Device Hub successfully");
            OnConnectionStateChanged?.Invoke(this, new ConnectionStateChangedEventArgs(true));
            return true;
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Failed to connect to Device Hub");
            OnConnectionStateChanged?.Invoke(this, new ConnectionStateChangedEventArgs(false));
            return false;
        }
    }

    /// <summary>
    /// Disconnects from backend SignalR hub
    /// </summary>
    public async Task DisconnectAsync()
    {
        if (_hubConnection != null)
        {
            try
            {
                await _hubConnection.StopAsync();
                await _hubConnection.DisposeAsync();
                Log.Information("Disconnected from Device Hub");
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error during disconnect");
            }
        }
    }

    /// <summary>
    /// Registers SignalR message handlers and connection events
    /// </summary>
    private void RegisterHandlers()
    {
        if (_hubConnection == null) return;

        // Handle print receipt command
        _hubConnection.On<PrintCommandDto>("PrintReceipt", (command) =>
        {
            Log.Information("Received print command: {CommandId}", command.CommandId);
            OnPrintCommandReceived?.Invoke(this, new PrintCommandEventArgs(command));
        });

        // Handle reconnecting event
        _hubConnection.Reconnecting += (error) =>
        {
            Log.Warning("Connection lost, reconnecting... Error: {Error}", error?.Message);
            OnConnectionStateChanged?.Invoke(this, new ConnectionStateChangedEventArgs(false));
            return Task.CompletedTask;
        };

        // Handle reconnected event
        _hubConnection.Reconnected += (connectionId) =>
        {
            Log.Information("Reconnected to Device Hub. Connection ID: {ConnectionId}", connectionId);
            OnConnectionStateChanged?.Invoke(this, new ConnectionStateChangedEventArgs(true));
            return Task.CompletedTask;
        };

        // Handle closed event
        _hubConnection.Closed += (error) =>
        {
            Log.Warning("Connection closed. Error: {Error}", error?.Message);
            OnConnectionStateChanged?.Invoke(this, new ConnectionStateChangedEventArgs(false));
            return Task.CompletedTask;
        };
    }

    /// <summary>
    /// Sends print completion status back to backend
    /// </summary>
    public async Task SendPrintCompletedAsync(string commandId, bool success, string? errorMessage)
    {
        if (_hubConnection == null || !IsConnected)
        {
            Log.Warning("Cannot send print completion - not connected");
            return;
        }

        try
        {
            var eventDto = new PrintCompletedEventDto
            {
                CommandId = commandId,
                Success = success,
                ErrorMessage = errorMessage,
                CompletedAt = DateTime.UtcNow
            };

            await _hubConnection.InvokeAsync("PrintCompleted", eventDto);
            Log.Information("Print completion sent for command {CommandId}: Success={Success}",
                commandId, success);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Failed to send print completion status for command {CommandId}", commandId);
        }
    }
}
