namespace KasserPro.API.Controllers;

using KasserPro.Application.DTOs.Backup;
using KasserPro.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// P2: Admin endpoints for backup, restore, and system management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly IBackupService _backupService;
    private readonly IRestoreService _restoreService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        IBackupService backupService,
        IRestoreService restoreService,
        ILogger<AdminController> logger)
    {
        _backupService = backupService;
        _restoreService = restoreService;
        _logger = logger;
    }

    /// <summary>
    /// P2: Creates a manual backup
    /// Requires: Admin or SystemOwner role
    /// </summary>
    [HttpPost("backup")]
    public async Task<ActionResult<BackupResult>> CreateBackup()
    {
        var userRole = User.FindFirst("role")?.Value;
        
        if (userRole != "Admin" && userRole != "SystemOwner")
        {
            return Forbid();
        }

        var userId = User.FindFirst("userId")?.Value;
        _logger.LogInformation("Manual backup requested by user {UserId}", userId);

        var result = await _backupService.CreateBackupAsync("manual");

        if (result.Success)
        {
            return Ok(result);
        }
        else
        {
            return StatusCode(500, result);
        }
    }

    /// <summary>
    /// P2: Lists all available backups
    /// Requires: Admin or SystemOwner role
    /// </summary>
    [HttpGet("backups")]
    public async Task<ActionResult<List<BackupInfo>>> ListBackups()
    {
        var userRole = User.FindFirst("role")?.Value;
        
        if (userRole != "Admin" && userRole != "SystemOwner")
        {
            return Forbid();
        }

        var backups = await _backupService.ListBackupsAsync();
        return Ok(backups);
    }

    /// <summary>
    /// P2: Restores database from backup
    /// Requires: SystemOwner role ONLY (critical operation)
    /// </summary>
    [HttpPost("restore")]
    public async Task<ActionResult<RestoreResult>> RestoreBackup([FromBody] RestoreRequest request)
    {
        var userRole = User.FindFirst("role")?.Value;
        
        // Only SystemOwner can restore
        if (userRole != "SystemOwner")
        {
            return Forbid();
        }

        var userId = User.FindFirst("userId")?.Value;
        _logger.LogWarning("Database restore requested by user {UserId}, backup: {BackupFileName}", 
            userId, request.BackupFileName);

        var result = await _restoreService.RestoreFromBackupAsync(request.BackupFileName);

        if (result.Success)
        {
            return Ok(result);
        }
        else
        {
            return StatusCode(500, result);
        }
    }
}

/// <summary>
/// P2: Request to restore from backup
/// </summary>
public class RestoreRequest
{
    public string BackupFileName { get; set; } = string.Empty;
}
