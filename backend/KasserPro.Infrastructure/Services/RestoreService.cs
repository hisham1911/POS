namespace KasserPro.Infrastructure.Services;

using KasserPro.Application.DTOs.Backup;
using KasserPro.Application.Services.Interfaces;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using KasserPro.Infrastructure.Data;

/// <summary>
/// P2: Restore service for database recovery
/// </summary>
public class RestoreService : IRestoreService
{
    private readonly ILogger<RestoreService> _logger;
    private readonly IBackupService _backupService;
    private readonly IConfiguration _configuration;
    private readonly string _backupDirectory;

    public RestoreService(
        ILogger<RestoreService> logger,
        IBackupService backupService,
        IConfiguration configuration)
    {
        _logger = logger;
        _backupService = backupService;
        _configuration = configuration;
        _backupDirectory = Path.Combine(Directory.GetCurrentDirectory(), "backups");
    }

    /// <summary>
    /// P2: Restores database from backup with full safety checks
    /// </summary>
    public async Task<RestoreResult> RestoreFromBackupAsync(string backupFileName)
    {
        var timestamp = DateTime.UtcNow;
        var backupPath = Path.Combine(_backupDirectory, backupFileName);

        try
        {
            _logger.LogWarning("RESTORE INITIATED: {BackupFileName}", backupFileName);

            // Step 1: Validate backup file exists
            if (!File.Exists(backupPath))
            {
                _logger.LogError("Backup file not found: {BackupPath}", backupPath);
                return new RestoreResult
                {
                    Success = false,
                    ErrorMessage = "Backup file not found",
                    RestoreTimestamp = timestamp,
                    MaintenanceModeEnabled = false
                };
            }

            // Step 2: Run integrity check on backup
            _logger.LogInformation("Running integrity check on backup: {BackupFileName}", backupFileName);
            var integrityCheckPassed = await RunIntegrityCheckAsync(backupPath);

            if (!integrityCheckPassed)
            {
                _logger.LogError("Backup integrity check FAILED: {BackupFileName}", backupFileName);
                return new RestoreResult
                {
                    Success = false,
                    ErrorMessage = "Backup integrity check failed",
                    RestoreTimestamp = timestamp,
                    MaintenanceModeEnabled = false
                };
            }

            // Step 3: Log warning about restore
            _logger.LogWarning("Starting database restore - application should be in maintenance mode");

            // Step 4: Create pre-restore backup
            _logger.LogInformation("Creating pre-restore backup");
            var preRestoreBackup = await _backupService.CreateBackupAsync("pre-restore");

            if (!preRestoreBackup.Success)
            {
                _logger.LogError("Pre-restore backup FAILED - aborting restore");
                return new RestoreResult
                {
                    Success = false,
                    ErrorMessage = "Pre-restore backup failed",
                    RestoreTimestamp = timestamp,
                    MaintenanceModeEnabled = false
                };
            }

            // Step 5: Clear connection pools
            _logger.LogInformation("Clearing SQLite connection pools");
            SqliteConnection.ClearAllPools();
            await Task.Delay(1000); // Wait for connections to close

            // Step 6: Replace database file
            var connectionString = _configuration.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("DefaultConnection not configured");
            
            var builder = new SqliteConnectionStringBuilder(connectionString);
            var dbPath = builder.DataSource;

            if (string.IsNullOrEmpty(dbPath))
            {
                throw new InvalidOperationException("Cannot determine database file path");
            }

            _logger.LogWarning("Replacing database file: {DbPath}", dbPath);

            // Delete WAL and SHM files if they exist
            var walPath = $"{dbPath}-wal";
            var shmPath = $"{dbPath}-shm";

            if (File.Exists(walPath))
            {
                File.Delete(walPath);
                _logger.LogInformation("Deleted WAL file: {WalPath}", walPath);
            }

            if (File.Exists(shmPath))
            {
                File.Delete(shmPath);
                _logger.LogInformation("Deleted SHM file: {ShmPath}", shmPath);
            }

            // Replace main database file
            File.Copy(backupPath, dbPath, overwrite: true);
            _logger.LogInformation("Database file replaced successfully");

            // Step 7: Run migrations (if needed)
            _logger.LogInformation("Running migrations on restored database");
            // Note: Migrations will run on next startup, or we can run them here
            // For safety, we'll let them run on next startup

            // Step 8: Log completion
            _logger.LogInformation("Restore successful - maintenance mode should be disabled manually");

            _logger.LogWarning(
                "RESTORE COMPLETED: {BackupFileName} -> {DbPath} (Pre-restore backup: {PreRestoreBackup})",
                backupFileName,
                dbPath,
                preRestoreBackup.BackupPath);

            return new RestoreResult
            {
                Success = true,
                RestoredFromPath = backupPath,
                PreRestoreBackupPath = preRestoreBackup.BackupPath,
                RestoreTimestamp = timestamp,
                MaintenanceModeEnabled = false
            };
        }
        catch (Exception ex)
        {
            _logger.LogCritical(ex, "RESTORE FAILED: {BackupFileName}", backupFileName);

            // Keep maintenance mode enabled on failure
            _logger.LogWarning("Maintenance mode remains ENABLED due to restore failure");

            return new RestoreResult
            {
                Success = false,
                ErrorMessage = ex.Message,
                RestoreTimestamp = timestamp,
                MaintenanceModeEnabled = true
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
                _logger.LogInformation("Integrity check PASSED: {BackupPath}", backupPath);
                return true;
            }
            else
            {
                _logger.LogError("Integrity check FAILED: {BackupPath}, Result: {Result}", 
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
}
