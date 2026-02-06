using KasserPro.BridgeApp.Models;

namespace KasserPro.BridgeApp.Services;

/// <summary>
/// Manages SignalR connection to backend Device Hub
/// </summary>
public interface ISignalRClientService
{
    /// <summary>
    /// Establishes connection to backend SignalR hub
    /// </summary>
    Task<bool> ConnectAsync();

    /// <summary>
    /// Disconnects from backend SignalR hub
    /// </summary>
    Task DisconnectAsync();

    /// <summary>
    /// Gets current connection status
    /// </summary>
    bool IsConnected { get; }

    /// <summary>
    /// Event raised when a print command is received from backend
    /// </summary>
    event EventHandler<PrintCommandEventArgs>? OnPrintCommandReceived;

    /// <summary>
    /// Event raised when connection state changes
    /// </summary>
    event EventHandler<ConnectionStateChangedEventArgs>? OnConnectionStateChanged;

    /// <summary>
    /// Sends print completion status back to backend
    /// </summary>
    Task SendPrintCompletedAsync(string commandId, bool success, string? errorMessage);
}

/// <summary>
/// Event args for print command received
/// </summary>
public class PrintCommandEventArgs : EventArgs
{
    public PrintCommandDto Command { get; }

    public PrintCommandEventArgs(PrintCommandDto command)
    {
        Command = command;
    }
}

/// <summary>
/// Event args for connection state changed
/// </summary>
public class ConnectionStateChangedEventArgs : EventArgs
{
    public bool IsConnected { get; }

    public ConnectionStateChangedEventArgs(bool isConnected)
    {
        IsConnected = isConnected;
    }
}
