namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Backup;

/// <summary>
/// P2: Service for restoring database from backups
/// </summary>
public interface IRestoreService
{
    /// <summary>
    /// Restores database from a backup file
    /// - Enables maintenance mode
    /// - Validates backup integrity
    /// - Creates pre-restore backup
    /// - Replaces database file
    /// - Runs migrations
    /// - Disables maintenance mode on success
    /// </summary>
    /// <param name="backupFileName">Name of backup file in backups directory</param>
    /// <returns>Restore result with status and metadata</returns>
    Task<RestoreResult> RestoreFromBackupAsync(string backupFileName);
}
