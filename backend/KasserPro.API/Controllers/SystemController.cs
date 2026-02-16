namespace KasserPro.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using KasserPro.Application.DTOs.System;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Infrastructure.Data;
using Microsoft.Extensions.Logging;

[ApiController]
[Route("api/system")]
[Authorize]
public class SystemController : ControllerBase
{
    private readonly ITenantService _tenantService;
    private readonly InventoryDataMigration _inventoryMigration;
    private readonly ILogger<SystemController> _logger;

    public SystemController(
        ITenantService tenantService,
        InventoryDataMigration inventoryMigration,
        ILogger<SystemController> logger)
    {
        _tenantService = tenantService;
        _inventoryMigration = inventoryMigration;
        _logger = logger;
    }

    /// <summary>
    /// Create a new tenant with admin user and default branch (SystemOwner only)
    /// </summary>
    [HttpGet("tenants")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<IActionResult> GetTenants()
    {
        var result = await _tenantService.GetAllTenantsForSystemOwnerAsync();
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Activate/Deactivate a tenant (SystemOwner only)
    /// </summary>
    [HttpPatch("tenants/{tenantId:int}/status")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<IActionResult> SetTenantStatus(int tenantId, [FromBody] SetTenantStatusRequest request)
    {
        var result = await _tenantService.SetTenantActiveStatusAsync(tenantId, request.IsActive);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Create a new tenant with admin user and default branch (SystemOwner only)
    /// </summary>
    [HttpPost("tenants")]
    [Authorize(Roles = "SystemOwner")]
    [EnableRateLimiting("SystemTenantCreation")]
    public async Task<IActionResult> CreateTenant([FromBody] CreateTenantRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _tenantService.CreateTenantWithAdminAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Migrate Product.StockQuantity to BranchInventory (Admin only)
    /// This is a one-time migration to fix products missing from inventory
    /// </summary>
    [HttpPost("migrate-inventory")]
    [Authorize(Roles = "Admin,SystemOwner")]
    public async Task<IActionResult> MigrateInventory()
    {
        try
        {
            _logger.LogInformation("Starting inventory migration...");
            var result = await _inventoryMigration.ExecuteAsync();
            
            if (result.Success)
            {
                _logger.LogInformation("Inventory migration completed successfully");
                return Ok(new
                {
                    success = true,
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
                        alreadyMigrated = result.AlreadyMigrated
                    }
                });
            }
            else
            {
                _logger.LogError("Inventory migration failed: {Message}", result.Message);
                return BadRequest(new
                {
                    success = false,
                    message = result.Message
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during inventory migration");
            return StatusCode(500, new
            {
                success = false,
                message = $"Migration failed: {ex.Message}"
            });
        }
    }
}
