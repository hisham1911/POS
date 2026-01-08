namespace KasserPro.Application.Services.Implementations;

using Microsoft.EntityFrameworkCore;
using KasserPro.Application.Common.Exceptions;
using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Inventory;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Entities;
using KasserPro.Domain.Enums;

/// <summary>
/// Service for inventory/stock management operations
/// </summary>
public class InventoryService : IInventoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public InventoryService(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<int> DecrementStockAsync(int productId, int quantity, int orderId)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be positive", nameof(quantity));

        var product = await GetProductForStockUpdateAsync(productId);
        if (product == null)
            throw new InvalidOperationException($"Product {productId} not found");

        if (!product.TrackInventory)
            return product.StockQuantity ?? 0;

        var balanceBefore = product.StockQuantity ?? 0;
        var balanceAfter = balanceBefore - quantity;

        // Check if negative stock is allowed for this tenant
        if (balanceAfter < 0)
        {
            var tenant = await _unitOfWork.Tenants.GetByIdAsync(_currentUser.TenantId);
            if (tenant != null && !tenant.AllowNegativeStock)
            {
                throw new InsufficientStockException(productId, product.Name, quantity, balanceBefore);
            }
        }

        // Update product stock
        product.StockQuantity = balanceAfter;
        product.LastStockUpdate = DateTime.UtcNow;

        // Record movement
        await RecordMovementAsync(product, StockMovementType.Sale, -quantity, balanceBefore, balanceAfter, 
            orderId, "Order", $"Sale - Order #{orderId}");

        await _unitOfWork.SaveChangesAsync();
        return balanceAfter;
    }

    public async Task<int> IncrementStockAsync(int productId, int quantity, int orderId)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be positive", nameof(quantity));

        var product = await GetProductForStockUpdateAsync(productId);
        if (product == null)
            throw new InvalidOperationException($"Product {productId} not found");

        var balanceBefore = product.StockQuantity ?? 0;
        var balanceAfter = balanceBefore + quantity;

        // Update product stock
        product.StockQuantity = balanceAfter;
        product.LastStockUpdate = DateTime.UtcNow;

        // Record movement
        await RecordMovementAsync(product, StockMovementType.Refund, quantity, balanceBefore, balanceAfter,
            orderId, "Order", $"Refund - Order #{orderId}");

        await _unitOfWork.SaveChangesAsync();
        return balanceAfter;
    }

    public async Task<int> AdjustStockAsync(int productId, StockAdjustmentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Reason))
            throw new ArgumentException("Reason is required for manual adjustments", nameof(request.Reason));

        var product = await GetProductForStockUpdateAsync(productId);
        if (product == null)
            throw new InvalidOperationException($"Product {productId} not found");

        var balanceBefore = product.StockQuantity ?? 0;
        var balanceAfter = balanceBefore + request.Quantity;

        // Update product stock
        product.StockQuantity = balanceAfter;
        product.LastStockUpdate = DateTime.UtcNow;

        // Map adjustment type to movement type
        var movementType = request.AdjustmentType switch
        {
            StockAdjustmentType.Receiving => StockMovementType.Receiving,
            StockAdjustmentType.Damage => StockMovementType.Damage,
            StockAdjustmentType.Transfer => StockMovementType.Transfer,
            _ => StockMovementType.Adjustment
        };

        // Record movement
        await RecordMovementAsync(product, movementType, request.Quantity, balanceBefore, balanceAfter,
            null, "Manual", request.Reason);

        await _unitOfWork.SaveChangesAsync();
        return balanceAfter;
    }

    public async Task BatchDecrementStockAsync(IEnumerable<(int ProductId, int Quantity)> items, int orderId)
    {
        var itemsList = items.ToList();
        if (!itemsList.Any()) return;

        var productIds = itemsList.Select(i => i.ProductId).ToList();
        var tenantId = _currentUser.TenantId;

        // Fetch tenant settings for stock validation
        var tenant = await _unitOfWork.Tenants.GetByIdAsync(tenantId);
        var allowNegativeStock = tenant?.AllowNegativeStock ?? false;

        var products = await _unitOfWork.Products.Query()
            .Where(p => productIds.Contains(p.Id) && p.TenantId == tenantId)
            .ToListAsync();

        // Validate stock availability if negative stock is not allowed
        if (!allowNegativeStock)
        {
            foreach (var product in products)
            {
                var item = itemsList.First(i => i.ProductId == product.Id);
                var currentStock = product.StockQuantity ?? 0;
                if (currentStock - item.Quantity < 0)
                {
                    throw new InsufficientStockException(product.Id, product.Name, item.Quantity, currentStock);
                }
            }
        }

        // Process stock decrements
        foreach (var product in products)
        {
            var item = itemsList.First(i => i.ProductId == product.Id);
            var balanceBefore = product.StockQuantity ?? 0;
            var balanceAfter = balanceBefore - item.Quantity;

            product.StockQuantity = balanceAfter;
            product.LastStockUpdate = DateTime.UtcNow;

            await RecordMovementAsync(product, StockMovementType.Sale, -item.Quantity, balanceBefore, balanceAfter,
                orderId, "Order", $"Sale - Order #{orderId}");
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task BatchIncrementStockAsync(IEnumerable<(int ProductId, int Quantity)> items, int orderId)
    {
        var itemsList = items.ToList();
        if (!itemsList.Any()) return;

        var productIds = itemsList.Select(i => i.ProductId).ToList();
        var tenantId = _currentUser.TenantId;

        var products = await _unitOfWork.Products.Query()
            .Where(p => productIds.Contains(p.Id) && p.TenantId == tenantId)
            .ToListAsync();

        foreach (var product in products)
        {
            var item = itemsList.First(i => i.ProductId == product.Id);
            var balanceBefore = product.StockQuantity ?? 0;
            var balanceAfter = balanceBefore + item.Quantity;

            product.StockQuantity = balanceAfter;
            product.LastStockUpdate = DateTime.UtcNow;

            await RecordMovementAsync(product, StockMovementType.Refund, item.Quantity, balanceBefore, balanceAfter,
                orderId, "Order", $"Refund - Order #{orderId}");
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<List<LowStockProductDto>> GetLowStockProductsAsync()
    {
        var tenantId = _currentUser.TenantId;

        var lowStockProducts = await _unitOfWork.Products.Query()
            .Include(p => p.Category)
            .Where(p => p.TenantId == tenantId 
                        && p.IsActive 
                        && p.TrackInventory 
                        && p.LowStockThreshold.HasValue 
                        && p.StockQuantity < p.LowStockThreshold)
            .Select(p => new LowStockProductDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                Sku = p.Sku,
                Barcode = p.Barcode,
                CurrentStock = p.StockQuantity ?? 0,
                LowStockThreshold = p.LowStockThreshold ?? 0,
                ReorderPoint = p.ReorderPoint,
                CategoryName = p.Category.Name
            })
            .OrderBy(p => p.CurrentStock)
            .ToListAsync();

        return lowStockProducts;
    }

    public async Task<PagedResult<StockMovementDto>> GetStockHistoryAsync(int productId, int page = 1, int pageSize = 20)
    {
        var tenantId = _currentUser.TenantId;
        
        // Verify product exists and belongs to tenant
        var productExists = await _unitOfWork.Products.Query()
            .AnyAsync(p => p.Id == productId && p.TenantId == tenantId);
            
        if (!productExists)
            return new PagedResult<StockMovementDto>(new List<StockMovementDto>(), 0, page, pageSize);

        var query = _unitOfWork.StockMovements.Query()
            .Include(sm => sm.Product)
            .Include(sm => sm.User)
            .Where(sm => sm.ProductId == productId && sm.TenantId == tenantId)
            .OrderByDescending(sm => sm.CreatedAt);

        var totalCount = await query.CountAsync();
        
        var movements = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(sm => new StockMovementDto
            {
                Id = sm.Id,
                ProductId = sm.ProductId,
                ProductName = sm.Product.Name,
                ProductSku = sm.Product.Sku,
                Type = sm.Type,
                Quantity = sm.Quantity,
                BalanceBefore = sm.BalanceBefore,
                BalanceAfter = sm.BalanceAfter,
                ReferenceId = sm.ReferenceId,
                ReferenceType = sm.ReferenceType,
                Reason = sm.Reason,
                UserId = sm.UserId,
                UserName = sm.User.Name,
                CreatedAt = sm.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<StockMovementDto>(movements, totalCount, page, pageSize);
    }

    public async Task<int> GetCurrentStockAsync(int productId)
    {
        var tenantId = _currentUser.TenantId;
        
        var product = await _unitOfWork.Products.Query()
            .Where(p => p.Id == productId && p.TenantId == tenantId)
            .Select(p => new { p.StockQuantity })
            .FirstOrDefaultAsync();

        return product?.StockQuantity ?? 0;
    }

    #region Private Methods

    private async Task<Product?> GetProductForStockUpdateAsync(int productId)
    {
        var tenantId = _currentUser.TenantId;
        return await _unitOfWork.Products.Query()
            .FirstOrDefaultAsync(p => p.Id == productId && p.TenantId == tenantId);
    }

    private async Task RecordMovementAsync(Product product, StockMovementType type, int quantity, 
        int balanceBefore, int balanceAfter, int? referenceId, string? referenceType, string? reason)
    {
        var movement = new StockMovement
        {
            TenantId = _currentUser.TenantId,
            BranchId = _currentUser.BranchId,
            ProductId = product.Id,
            Type = type,
            Quantity = quantity,
            BalanceBefore = balanceBefore,
            BalanceAfter = balanceAfter,
            ReferenceId = referenceId,
            ReferenceType = referenceType,
            Reason = reason,
            UserId = _currentUser.UserId
        };

        await _unitOfWork.StockMovements.AddAsync(movement);
    }

    #endregion
}
