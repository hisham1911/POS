namespace KasserPro.Application.DTOs.Orders;

using KasserPro.Domain.Enums;

public class CreateOrderRequest
{
    public OrderType OrderType { get; set; } = OrderType.DineIn;
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public int? CustomerId { get; set; }
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
    public List<PaymentRequest> Payments { get; set; } = new();
}

public class PaymentRequest
{
    public string Method { get; set; } = "Cash";
    public decimal Amount { get; set; }
    public string? Reference { get; set; }
}
