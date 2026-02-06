namespace KasserPro.Application.DTOs.Orders;

/// <summary>
/// Print command sent to Desktop Bridge App via SignalR
/// </summary>
public class PrintCommandDto
{
    public string CommandId { get; set; } = string.Empty;
    public ReceiptDto Receipt { get; set; } = new();
}

/// <summary>
/// Receipt data for printing
/// </summary>
public class ReceiptDto
{
    public string ReceiptNumber { get; set; } = string.Empty;
    public string BranchName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public List<ReceiptItemDto> Items { get; set; } = new();
    public decimal NetTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string CashierName { get; set; } = string.Empty;
}

/// <summary>
/// Individual item on a receipt
/// </summary>
public class ReceiptItemDto
{
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}
