namespace KasserPro.Application.Services.Implementations;

using Microsoft.EntityFrameworkCore;
using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Orders;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Entities;
using KasserPro.Domain.Enums;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;

    public OrderService(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<ApiResponse<OrderDto>> CreateAsync(CreateOrderRequest request, int userId)
    {
        var order = new Order
        {
            OrderNumber = GenerateOrderNumber(),
            UserId = userId,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            Notes = request.Notes,
            Status = OrderStatus.Draft
        };

        foreach (var item in request.Items)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId);
            if (product == null) continue;

            var orderItem = new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                UnitPrice = product.Price,
                UnitCost = product.Cost,
                Quantity = item.Quantity,
                Notes = item.Notes
            };
            orderItem.Total = orderItem.UnitPrice * orderItem.Quantity;
            order.Items.Add(orderItem);
        }

        CalculateOrderTotals(order);

        await _unitOfWork.Orders.AddAsync(order);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<OrderDto>.Ok(MapToDto(order), "تم إنشاء الطلب بنجاح");
    }

    public async Task<ApiResponse<OrderDto>> GetByIdAsync(int id)
    {
        var order = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return ApiResponse<OrderDto>.Fail("الطلب غير موجود");

        return ApiResponse<OrderDto>.Ok(MapToDto(order));
    }

    public async Task<ApiResponse<List<OrderDto>>> GetTodayOrdersAsync()
    {
        var today = DateTime.UtcNow.Date;
        var orders = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .Where(o => o.CreatedAt.Date == today)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return ApiResponse<List<OrderDto>>.Ok(orders.Select(MapToDto).ToList());
    }

    public async Task<ApiResponse<OrderDto>> AddItemAsync(int orderId, AddOrderItemRequest request)
    {
        var order = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            return ApiResponse<OrderDto>.Fail("الطلب غير موجود");

        if (order.Status != OrderStatus.Draft)
            return ApiResponse<OrderDto>.Fail("لا يمكن تعديل طلب مكتمل");

        var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId);
        if (product == null)
            return ApiResponse<OrderDto>.Fail("المنتج غير موجود");

        var orderItem = new OrderItem
        {
            ProductId = product.Id,
            ProductName = product.Name,
            UnitPrice = product.Price,
            Quantity = request.Quantity,
            Notes = request.Notes,
            Total = product.Price * request.Quantity
        };

        order.Items.Add(orderItem);
        CalculateOrderTotals(order);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<OrderDto>.Ok(MapToDto(order));
    }

    public async Task<ApiResponse<OrderDto>> RemoveItemAsync(int orderId, int itemId)
    {
        var order = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            return ApiResponse<OrderDto>.Fail("الطلب غير موجود");

        var item = order.Items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            order.Items.Remove(item);
            CalculateOrderTotals(order);
            await _unitOfWork.SaveChangesAsync();
        }

        return ApiResponse<OrderDto>.Ok(MapToDto(order));
    }

    public async Task<ApiResponse<OrderDto>> CompleteAsync(int orderId, CompleteOrderRequest request)
    {
        var order = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            return ApiResponse<OrderDto>.Fail("الطلب غير موجود");

        order.Status = OrderStatus.Completed;
        order.AmountPaid = request.AmountPaid;
        order.ChangeAmount = request.AmountPaid - order.Total;
        order.CompletedAt = DateTime.UtcNow;

        var payment = new Payment
        {
            OrderId = order.Id,
            Amount = request.AmountPaid,
            Method = Enum.Parse<PaymentMethod>(request.PaymentMethod),
            Reference = request.PaymentReference
        };

        await _unitOfWork.Payments.AddAsync(payment);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<OrderDto>.Ok(MapToDto(order), "تم إكمال الطلب بنجاح");
    }

    public async Task<ApiResponse<bool>> CancelAsync(int orderId, string? reason)
    {
        var order = await _unitOfWork.Orders.GetByIdAsync(orderId);
        if (order == null)
            return ApiResponse<bool>.Fail("الطلب غير موجود");

        order.Status = OrderStatus.Cancelled;
        order.CancelledAt = DateTime.UtcNow;
        order.Notes = reason;

        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.Ok(true, "تم إلغاء الطلب");
    }

    private static void CalculateOrderTotals(Order order)
    {
        order.Subtotal = order.Items.Sum(i => i.Total);
        order.TaxAmount = order.Subtotal * (order.TaxRate / 100);
        order.Total = order.Subtotal + order.TaxAmount - order.DiscountAmount;
    }

    private static string GenerateOrderNumber()
        => $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

    private static OrderDto MapToDto(Order order) => new()
    {
        Id = order.Id,
        OrderNumber = order.OrderNumber,
        Status = order.Status.ToString(),
        Subtotal = order.Subtotal,
        DiscountAmount = order.DiscountAmount,
        TaxAmount = order.TaxAmount,
        Total = order.Total,
        AmountPaid = order.AmountPaid,
        ChangeAmount = order.ChangeAmount,
        CustomerName = order.CustomerName,
        Notes = order.Notes,
        CreatedAt = order.CreatedAt,
        Items = order.Items.Select(i => new OrderItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            UnitPrice = i.UnitPrice,
            Quantity = i.Quantity,
            Total = i.Total
        }).ToList()
    };
}
