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
    
    /// <summary>
    /// Whether the application needs a restart after restore
    /// (always true on successful restore for safety)
    /// </summary>
    public bool RequiresRestart { get; set; }
    
    /// <summary>
    /// Number of migrations applied after restore (0 if backup was same schema version)
    /// </summary>
    public int MigrationsApplied { get; set; }
    
    /// <summary>
    /// Number of data validation issues found after restore
    /// (0 = clean data, >0 = possible data type mismatches - see logs for details)
    /// </summary>
    public int DataValidationIssuesFound { get; set; }
}
