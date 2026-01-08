namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Inventory;
using KasserPro.Domain.Enums;

/// <summary>
/// Service for inventory/stock management operations
/// </summary>
public interface IInventoryService
{
    /// <summary>
    /// Decrement stock when order is completed (sale)
    /// </summary>
    /// <param name="productId">Product ID</param>
    /// <param name="quantity">Quantity to decrement (positive number)</param>
    /// <param name="orderId">Reference order ID</param>
    /// <returns>New stock balance</returns>
    Task<int> DecrementStockAsync(int productId, int quantity, int orderId);
    
    /// <summary>
    /// Increment stock when order is refunded
    /// </summary>
    /// <param name="productId">Product ID</param>
    /// <param name="quantity">Quantity to increment (positive number)</param>
    /// <param name="orderId">Reference order ID</param>
    /// <returns>New stock balance</returns>
    Task<int> IncrementStockAsync(int productId, int quantity, int orderId);
    
    /// <summary>
    /// Manual stock adjustment (receiving, damage, transfer, etc.)
    /// </summary>
    /// <param name="productId">Product ID</param>
    /// <param name="request">Adjustment details</param>
    /// <returns>New stock balance</returns>
    Task<int> AdjustStockAsync(int productId, StockAdjustmentRequest request);
    
    /// <summary>
    /// Batch decrement for order completion (all items at once)
    /// </summary>
    /// <param name="items">List of product ID and quantity pairs</param>
    /// <param name="orderId">Reference order ID</param>
    Task BatchDecrementStockAsync(IEnumerable<(int ProductId, int Quantity)> items, int orderId);
    
    /// <summary>
    /// Batch increment for order refund (all items at once)
    /// </summary>
    /// <param name="items">List of product ID and quantity pairs</param>
    /// <param name="orderId">Reference order ID</param>
    Task BatchIncrementStockAsync(IEnumerable<(int ProductId, int Quantity)> items, int orderId);
    
    /// <summary>
    /// Get all products below their low stock threshold
    /// </summary>
    Task<List<LowStockProductDto>> GetLowStockProductsAsync();
    
    /// <summary>
    /// Get stock movement history for a product
    /// </summary>
    /// <param name="productId">Product ID</param>
    /// <param name="page">Page number (1-based)</param>
    /// <param name="pageSize">Items per page</param>
    Task<PagedResult<StockMovementDto>> GetStockHistoryAsync(int productId, int page = 1, int pageSize = 20);
    
    /// <summary>
    /// Get current stock level for a product
    /// </summary>
    Task<int> GetCurrentStockAsync(int productId);
}
