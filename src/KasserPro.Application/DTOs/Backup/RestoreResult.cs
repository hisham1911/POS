namespace KasserPro.Application.DTOs.Backup;

/// <summary>
/// P2: Result of a restore operation
/// </summary>
public class RestoreResult
{
    public bool Success { get; set; }
    public string? RestoredFromPath { get; set; }
    public string? PreRestoreBackupPath { get; set; }
    public DateTime RestoreTimestamp { get; set; }
    public bool MaintenanceModeEnabled { get; set; }
    public string? ErrorMessage { get; set; }
}
