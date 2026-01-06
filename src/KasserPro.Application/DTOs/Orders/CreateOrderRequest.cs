namespace KasserPro.Application.DTOs.Orders;

public class CreateOrderRequest
{
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? Notes { get; set; }
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}

public class CreateOrderItemRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; } = 1;
    public string? Notes { get; set; }
}

public class AddOrderItemRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; } = 1;
    public string? Notes { get; set; }
}

public class CompleteOrderRequest
{
    public decimal AmountPaid { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
    public string? PaymentReference { get; set; }
}
