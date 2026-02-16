namespace KasserPro.Application.DTOs.Inventory;

using KasserPro.Domain.Enums;

/// <summary>
/// Stock movement history record
/// </summary>
public class StockMovementDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductSku { get; set; }
    public StockMovementType Type { get; set; }
    public string TypeName => Type.ToString();
    public int Quantity { get; set; }
    public int BalanceBefore { get; set; }
    public int BalanceAfter { get; set; }
    public int? ReferenceId { get; set; }
    public string? ReferenceType { get; set; }
    public string? Reason { get; set; }
    public int UserId { get; set; }
    public string? UserName { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Request to adjust stock manually
/// </summary>
public class StockAdjustmentRequest
{
    /// <summary>
    /// Adjustment quantity (positive to add, negative to remove)
    /// </summary>
    public int Quantity { get; set; }
    
    /// <summary>
    /// Reason for adjustment (required)
    /// </summary>
    public string Reason { get; set; } = string.Empty;
    
    /// <summary>
    /// Type of adjustment
    /// </summary>
    public StockAdjustmentType AdjustmentType { get; set; } = StockAdjustmentType.Adjustment;
}

/// <summary>
/// Types of manual stock adjustments
/// </summary>
public enum StockAdjustmentType
{
    /// <summary>General adjustment</summary>
    Adjustment,
    /// <summary>Stock received from supplier</summary>
    Receiving,
    /// <summary>Damaged goods</summary>
    Damage,
    /// <summary>Transfer between locations</summary>
    Transfer
}

/// <summary>
/// Low stock alert item
/// </summary>
public class LowStockProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public string? Barcode { get; set; }
    public int CurrentStock { get; set; }
    public int LowStockThreshold { get; set; }
    public int? ReorderPoint { get; set; }
    public int StockDeficit => LowStockThreshold - CurrentStock;
    public string CategoryName { get; set; } = string.Empty;
}
