namespace KasserPro.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KasserPro.Application.DTOs.Inventory;
using KasserPro.Application.Services.Interfaces;

/// <summary>
/// Inventory management endpoints for stock control
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService) 
        => _inventoryService = inventoryService;

    /// <summary>
    /// Get all products below their low stock threshold
    /// </summary>
    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStockProducts()
    {
        var result = await _inventoryService.GetLowStockProductsAsync();
        return Ok(new { Success = true, Data = result, Count = result.Count });
    }

    /// <summary>
    /// Get stock movement history for a specific product
    /// </summary>
    /// <param name="productId">Product ID</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Items per page (default: 20)</param>
    [HttpGet("products/{productId}/history")]
    public async Task<IActionResult> GetStockHistory(int productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _inventoryService.GetStockHistoryAsync(productId, page, pageSize);
        return Ok(new { Success = true, Data = result });
    }

    /// <summary>
    /// Get current stock level for a product
    /// </summary>
    [HttpGet("products/{productId}/stock")]
    public async Task<IActionResult> GetCurrentStock(int productId)
    {
        var stock = await _inventoryService.GetCurrentStockAsync(productId);
        return Ok(new { Success = true, Data = new { ProductId = productId, CurrentStock = stock } });
    }

    /// <summary>
    /// Adjust stock manually (receiving, damage, transfer, etc.)
    /// </summary>
    /// <param name="productId">Product ID</param>
    /// <param name="request">Adjustment details</param>
    [HttpPost("products/{productId}/adjust")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> AdjustStock(int productId, [FromBody] StockAdjustmentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Reason))
            return BadRequest(new { Success = false, Message = "Reason is required for stock adjustment" });

        try
        {
            var newBalance = await _inventoryService.AdjustStockAsync(productId, request);
            return Ok(new { 
                Success = true, 
                Message = "Stock adjusted successfully",
                Data = new { ProductId = productId, NewBalance = newBalance } 
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { Success = false, Message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Success = false, Message = ex.Message });
        }
    }
}
