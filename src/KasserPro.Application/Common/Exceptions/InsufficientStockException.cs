namespace KasserPro.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when attempting to sell more stock than available
/// and the tenant does not allow negative stock.
/// </summary>
public class InsufficientStockException : Exception
{
    public int ProductId { get; }
    public string ProductName { get; }
    public int RequestedQuantity { get; }
    public int AvailableStock { get; }

    public InsufficientStockException(int productId, string productName, int requestedQuantity, int availableStock)
        : base($"Insufficient stock for product '{productName}' (ID: {productId}). Requested: {requestedQuantity}, Available: {availableStock}")
    {
        ProductId = productId;
        ProductName = productName;
        RequestedQuantity = requestedQuantity;
        AvailableStock = availableStock;
    }

    /// <summary>
    /// Arabic message for user display
    /// </summary>
    public string ArabicMessage => $"المخزون غير كافٍ للمنتج '{ProductName}'. المطلوب: {RequestedQuantity}، المتاح: {AvailableStock}";
}
