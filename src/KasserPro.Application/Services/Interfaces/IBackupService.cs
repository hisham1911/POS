namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Backup;

/// <summary>
/// P2: Service for creating and managing database backups
/// </summary>
public interface IBackupService
{
    /// <summary>
    /// Creates a hot backup of the database using SQLite Backup API
    /// </summary>
    /// <param name="reason">Reason for backup (e.g., "manual", "daily-scheduled", "pre-migration")</param>
    /// <returns>Backup result with path and metadata</returns>
    Task<BackupResult> CreateBackupAsync(string reason);

    /// <summary>
    /// Deletes old backups, keeping last 14 daily backups
    /// Pre-migration backups are retained indefinitely
    /// </summary>
    Task DeleteOldBackupsAsync();

    /// <summary>
    /// Lists all available backups
    /// </summary>
    Task<List<BackupInfo>> ListBackupsAsync();
}

/// <summary>
/// P2: Information about a backup file
/// </summary>
public class BackupInfo
{
    public string FileName { get; set; } = string.Empty;
    public string FullPath { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Reason { get; set; } = string.Empty;
    public bool IsPreMigration { get; set; }
}
