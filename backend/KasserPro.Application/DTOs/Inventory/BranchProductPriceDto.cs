namespace KasserPro.Application.DTOs.Inventory;

public class BranchProductPriceDto
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal DefaultPrice { get; set; }
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public bool IsActive { get; set; }
}

public class SetBranchPriceRequest
{
    public int BranchId { get; set; }
    public int ProductId { get; set; }
    public decimal Price { get; set; }
    public DateTime? EffectiveFrom { get; set; }
}

public class AdjustInventoryRequest
{
    public int BranchId { get; set; }
    public int ProductId { get; set; }
    public int QuantityChange { get; set; } // Can be positive or negative
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
