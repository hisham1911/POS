namespace KasserPro.BridgeApp.Models;

/// <summary>
/// Print command received from backend via SignalR
/// </summary>
public class PrintCommandDto
{
    public string CommandId { get; set; } = string.Empty;
    public ReceiptDto Receipt { get; set; } = new();
}

/// <summary>
/// Print completion event sent back to backend
/// </summary>
public class PrintCompletedEventDto
{
    public string CommandId { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CompletedAt { get; set; }
}
