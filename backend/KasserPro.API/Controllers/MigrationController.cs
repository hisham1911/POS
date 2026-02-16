namespace KasserPro.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using KasserPro.Infrastructure.Data;

/// <summary>
/// ONE-TIME DATA MIGRATION CONTROLLER
/// Use this to migrate Product.StockQuantity to BranchInventory
/// </summary>
[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class MigrationController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<MigrationController> _logger;
    private readonly ILoggerFactory _loggerFactory;

    public MigrationController(AppDbContext context, ILogger<MigrationController> logger, ILoggerFactory loggerFactory)
    {
        _context = context;
        _logger = logger;
        _loggerFactory = loggerFactory;
    }

    /// <summary>
    /// Execute inventory data migration (ONE-TIME ONLY)
    /// Migrates Product.StockQuantity to BranchInventory
    /// This endpoint is IDEMPOTENT - safe to call multiple times
    /// </summary>
    /// <returns>Migration result with summary</returns>
    [HttpPost("inventory-data")]
    public async Task<IActionResult> MigrateInventoryData()
    {
        _logger.LogInformation("Inventory data migration requested by user");

        var migrationLogger = _loggerFactory.CreateLogger<InventoryDataMigration>();
        var migration = new InventoryDataMigration(_context, migrationLogger);
        var result = await migration.ExecuteAsync();

        if (result.Success)
        {
            return Ok(new
            {
                success = true,
                alreadyMigrated = result.AlreadyMigrated,
                message = result.Message,
                summary = result.GetSummary(),
                data = new
                {
                    productsMigrated = result.ProductsMigrated,
                    inventoriesCreated = result.InventoriesCreated,
                    productsWithStock = result.ProductsWithStock,
                    totalStockBefore = result.TotalStockBefore,
                    totalStockAfter = result.TotalStockAfter,
                    durationMs = result.DurationMs,
                    startTime = result.StartTime,
                    endTime = result.EndTime
                }
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Message,
            summary = result.GetSummary()
        });
    }

    /// <summary>
    /// Check if inventory migration has been executed
    /// </summary>
    [HttpGet("inventory-data/status")]
    public async Task<IActionResult> GetMigrationStatus()
    {
        var hasBranchInventories = await _context.BranchInventories.AnyAsync();
        var productsWithStock = await _context.Products.CountAsync(p => p.StockQuantity > 0);
        var totalBranchInventory = await _context.BranchInventories.CountAsync();

        return Ok(new
        {
            migrationExecuted = hasBranchInventories,
            branchInventoryRecords = totalBranchInventory,
            productsWithOldStock = productsWithStock,
            needsMigration = !hasBranchInventories && productsWithStock > 0,
            message = hasBranchInventories 
                ? "✅ Migration already executed" 
                : productsWithStock > 0 
                    ? "⚠️ Migration needed - products have stock in old format"
                    : "✅ No migration needed - no stock data"
        });
    }
}
