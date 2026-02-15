namespace KasserPro.Application.DTOs.Backup;

/// <summary>
/// P2: Result of a backup operation
/// </summary>
public class BackupResult
{
    public bool Success { get; set; }
    public string? BackupPath { get; set; }
    public long BackupSizeBytes { get; set; }
    public DateTime BackupTimestamp { get; set; }
    public string? Reason { get; set; }
    public bool IntegrityCheckPassed { get; set; }
    public string? ErrorMessage { get; set; }
}
