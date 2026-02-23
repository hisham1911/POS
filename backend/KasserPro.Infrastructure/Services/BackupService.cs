namespace KasserPro.Infrastructure.Services;

using KasserPro.Application.DTOs.Backup;
using KasserPro.Application.Services.Interfaces;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Data;

/// <summary>
/// P2: Backup service using SQLite Backup API for hot backups
/// </summary>
public class BackupService : IBackupService
{
    private readonly ILogger<BackupService> _logger;
    private readonly string _connectionString;
    private readonly string _backupDirectory;

    public BackupService(
        ILogger<BackupService> logger,
        IConfiguration configuration)
    {
        _logger = logger;
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("DefaultConnection not configured");
        _backupDirectory = Path.Combine(Directory.GetCurrentDirectory(), "backups");

        // Ensure backup directory exists
        if (!Directory.Exists(_backupDirectory))
        {
            Directory.CreateDirectory(_backupDirectory);
            _logger.LogInformation("Created backup directory: {BackupDirectory}", _backupDirectory);
        }
    }

    /// <summary>
    /// P2: Creates a hot backup using SQLite Backup API
    /// </summary>
    public async Task<BackupResult> CreateBackupAsync(string reason)
    {
        var timestamp = DateTime.UtcNow;
        
        // P2: Include reason in filename for easy identification
        var fileName = reason switch
        {
            "pre-migration" => $"kasserpro-backup-{timestamp:yyyyMMdd-HHmmss}-pre-migration.db",
            "pre-restore" => $"kasserpro-backup-{timestamp:yyyyMMdd-HHmmss}-pre-restore.db",
            "daily-scheduled" => $"kasserpro-backup-{timestamp:yyyyMMdd-HHmmss}-daily-scheduled.db",
            _ => $"kasserpro-backup-{timestamp:yyyyMMdd-HHmmss}.db"
        };
        
        var backupPath = Path.Combine(_backupDirectory, fileName);

        try
        {
            _logger.LogInformation("Starting backup: {FileName} (Reason: {Reason})", fileName, reason);

            // Extract database file path from connection string
            var builder = new SqliteConnectionStringBuilder(_connectionString);
            var sourceDbPath = builder.DataSource;

            if (string.IsNullOrEmpty(sourceDbPath))
            {
                throw new InvalidOperationException("Cannot determine database file path from connection string");
            }

            // Use SQLite Backup API for hot backup
            using var sourceConnection = new SqliteConnection(_connectionString);
            await sourceConnection.OpenAsync();

            using var backupConnection = new SqliteConnection($"Data Source={backupPath}");
            await backupConnection.OpenAsync();

            // Perform backup using SQLite Backup API
            sourceConnection.BackupDatabase(backupConnection);

            _logger.LogInformation("Backup completed: {FileName}", fileName);

            // Run integrity check on backup
            var integrityCheckPassed = await RunIntegrityCheckAsync(backupPath);

            if (!integrityCheckPassed)
            {
                _logger.LogError("Backup integrity check FAILED: {FileName}", fileName);
                
                // Delete corrupt backup
                if (File.Exists(backupPath))
                {
                    File.Delete(backupPath);
                    _logger.LogWarning("Deleted corrupt backup: {FileName}", fileName);
                }

                return new BackupResult
                {
                    Success = false,
                    ErrorMessage = "Backup integrity check failed",
                    BackupTimestamp = timestamp,
                    Reason = reason,
                    IntegrityCheckPassed = false
                };
            }

            var fileInfo = new FileInfo(backupPath);

            _logger.LogInformation(
                "Backup successful: {FileName} ({SizeMB:F2} MB, Reason: {Reason})",
                fileName,
                fileInfo.Length / 1024.0 / 1024.0,
                reason);

            return new BackupResult
            {
                Success = true,
                BackupPath = backupPath,
                BackupSizeBytes = fileInfo.Length,
                BackupTimestamp = timestamp,
                Reason = reason,
                IntegrityCheckPassed = true
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Backup failed: {FileName}", fileName);
            
            // Clean up partial backup
            if (File.Exists(backupPath))
            {
                try
                {
                    File.Delete(backupPath);
                }
                catch (Exception deleteEx)
                {
                    _logger.LogWarning(deleteEx, "Failed to delete partial backup: {FileName}", fileName);
                }
            }

            return new BackupResult
            {
                Success = false,
                ErrorMessage = ex.Message,
                BackupTimestamp = timestamp,
                Reason = reason,
                IntegrityCheckPassed = false
            };
        }
    }

    /// <summary>
    /// P2: Runs SQLite integrity check on backup file
    /// </summary>
    private async Task<bool> RunIntegrityCheckAsync(string backupPath)
    {
        try
        {
            using var connection = new SqliteConnection($"Data Source={backupPath}");
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = "PRAGMA integrity_check;";
            
            var result = await command.ExecuteScalarAsync();
            var integrityResult = result?.ToString() ?? string.Empty;

            if (integrityResult.Equals("ok", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogInformation("Backup integrity check PASSED: {BackupPath}", backupPath);
                return true;
            }
            else
            {
                _logger.LogError("Backup integrity check FAILED: {BackupPath}, Result: {Result}", 
                    backupPath, integrityResult);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Integrity check error: {BackupPath}", backupPath);
            return false;
        }
    }

    /// <summary>
    /// P2: Deletes old backups, keeping last 14 daily backups
    /// Pre-migration backups are retained indefinitely
    /// </summary>
    public async Task DeleteOldBackupsAsync()
    {
        await Task.Run(() =>
        {
            try
            {
                var backupFiles = Directory.GetFiles(_backupDirectory, "kasserpro-backup-*.db")
                    .Select(f => new FileInfo(f))
                    .OrderByDescending(f => f.CreationTimeUtc)
                    .ToList();

                _logger.LogInformation("Found {Count} backup files", backupFiles.Count);

                // Separate pre-migration backups (retain indefinitely)
                var preMigrationBackups = backupFiles
                    .Where(f => f.Name.Contains("pre-migration", StringComparison.OrdinalIgnoreCase))
                    .ToList();

                var regularBackups = backupFiles
                    .Except(preMigrationBackups)
                    .ToList();

                // Keep last 14 regular backups
                var backupsToDelete = regularBackups.Skip(14).ToList();

                foreach (var backup in backupsToDelete)
                {
                    try
                    {
                        backup.Delete();
                        _logger.LogInformation("Deleted old backup: {FileName}", backup.Name);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to delete backup: {FileName}", backup.Name);
                    }
                }

                _logger.LogInformation(
                    "Backup cleanup complete: {Deleted} deleted, {Kept} regular backups kept, {PreMigration} pre-migration backups retained",
                    backupsToDelete.Count,
                    regularBackups.Count - backupsToDelete.Count,
                    preMigrationBackups.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Backup cleanup failed");
            }
        });
    }

    /// <summary>
    /// P2: Lists all available backups
    /// </summary>
    public async Task<List<BackupInfo>> ListBackupsAsync()
    {
        return await Task.Run(() =>
        {
            try
            {
                var backupFiles = Directory.GetFiles(_backupDirectory, "kasserpro-backup-*.db")
                    .Select(f => new FileInfo(f))
                    .OrderByDescending(f => f.CreationTimeUtc)
                    .Select(f => new BackupInfo
                    {
                        FileName = f.Name,
                        FullPath = f.FullName,
                        SizeBytes = f.Length,
                        CreatedAt = f.CreationTimeUtc,
                        Reason = ExtractReasonFromFileName(f.Name),
                        IsPreMigration = f.Name.Contains("pre-migration", StringComparison.OrdinalIgnoreCase)
                    })
                    .ToList();

                return backupFiles;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to list backups");
                return new List<BackupInfo>();
            }
        });
    }

    /// <summary>
    /// Extracts reason from backup filename
    /// </summary>
    private string ExtractReasonFromFileName(string fileName)
    {
        // kasserpro-backup-20260214-143045.db -> "manual"
        // kasserpro-backup-20260214-143045-pre-migration.db -> "pre-migration"
        // kasserpro-backup-20260214-143045-pre-restore.db -> "pre-restore"
        // kasserpro-backup-20260214-020000-daily-scheduled.db -> "daily-scheduled"
        
        if (fileName.Contains("pre-migration", StringComparison.OrdinalIgnoreCase))
            return "pre-migration";
        
        if (fileName.Contains("pre-restore", StringComparison.OrdinalIgnoreCase))
            return "pre-restore";
        
        if (fileName.Contains("daily-scheduled", StringComparison.OrdinalIgnoreCase))
            return "daily-scheduled";
        
        return "manual";
    }
}
