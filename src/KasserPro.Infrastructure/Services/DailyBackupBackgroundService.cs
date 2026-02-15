namespace KasserPro.Infrastructure.Services;

using KasserPro.Application.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

/// <summary>
/// P2: Background service that creates daily backups at 2:00 AM local time
/// </summary>
public class DailyBackupBackgroundService : BackgroundService
{
    private readonly ILogger<DailyBackupBackgroundService> _logger;
    private readonly IServiceProvider _serviceProvider;

    public DailyBackupBackgroundService(
        ILogger<DailyBackupBackgroundService> logger,
        IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Daily backup scheduler started (Target: 2:00 AM local time)");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var now = DateTime.Now;
                var nextRun = CalculateNextRunTime(now);
                var delay = nextRun - now;

                _logger.LogInformation(
                    "Next daily backup scheduled for: {NextRun:yyyy-MM-dd HH:mm:ss} (in {Hours:F1} hours)",
                    nextRun,
                    delay.TotalHours);

                // Wait until next run time
                await Task.Delay(delay, stoppingToken);

                if (stoppingToken.IsCancellationRequested)
                    break;

                // Create backup
                await CreateDailyBackupAsync();

                // Clean up old backups
                await CleanupOldBackupsAsync();
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Daily backup scheduler stopped");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in daily backup scheduler");
                
                // Wait 1 hour before retrying on error
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }
    }

    /// <summary>
    /// Calculates next 2:00 AM local time
    /// </summary>
    private DateTime CalculateNextRunTime(DateTime now)
    {
        var targetTime = new DateTime(now.Year, now.Month, now.Day, 2, 0, 0);

        // If it's already past 2:00 AM today, schedule for tomorrow
        if (now >= targetTime)
        {
            targetTime = targetTime.AddDays(1);
        }

        return targetTime;
    }

    /// <summary>
    /// Creates daily scheduled backup
    /// </summary>
    private async Task CreateDailyBackupAsync()
    {
        try
        {
            _logger.LogInformation("Starting daily scheduled backup");

            using var scope = _serviceProvider.CreateScope();
            var backupService = scope.ServiceProvider.GetRequiredService<IBackupService>();

            var result = await backupService.CreateBackupAsync("daily-scheduled");

            if (result.Success)
            {
                _logger.LogInformation(
                    "Daily backup completed successfully: {BackupPath} ({SizeMB:F2} MB)",
                    result.BackupPath,
                    result.BackupSizeBytes / 1024.0 / 1024.0);
            }
            else
            {
                _logger.LogError("Daily backup FAILED: {ErrorMessage}", result.ErrorMessage);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Daily backup failed with exception");
        }
    }

    /// <summary>
    /// Cleans up old backups (keep last 14)
    /// </summary>
    private async Task CleanupOldBackupsAsync()
    {
        try
        {
            _logger.LogInformation("Starting backup cleanup");

            using var scope = _serviceProvider.CreateScope();
            var backupService = scope.ServiceProvider.GetRequiredService<IBackupService>();

            await backupService.DeleteOldBackupsAsync();

            _logger.LogInformation("Backup cleanup completed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Backup cleanup failed");
        }
    }
}
