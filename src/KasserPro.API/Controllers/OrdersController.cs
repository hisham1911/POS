namespace KasserPro.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KasserPro.Application.DTOs.Orders;
using KasserPro.Application.Services.Interfaces;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService) => _orderService = orderService;

    [HttpGet]
    public async Task<IActionResult> GetAllOrders(
        [FromQuery] string? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _orderService.GetAllAsync(status, fromDate, toDate, page, pageSize);
        return Ok(result);
    }

    [HttpGet("today")]
    public async Task<IActionResult> GetTodayOrders()
    {
        var result = await _orderService.GetTodayOrdersAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _orderService.GetByIdAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Get all orders for a specific customer with pagination
    /// </summary>
    [HttpGet("by-customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(int customerId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _orderService.GetByCustomerIdAsync(customerId, page, pageSize);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
    {
        var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
        var result = await _orderService.CreateAsync(request, userId);
        return result.Success ? CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result) : BadRequest(result);
    }

    [HttpPost("{id}/items")]
    public async Task<IActionResult> AddItem(int id, [FromBody] AddOrderItemRequest request)
    {
        var result = await _orderService.AddItemAsync(id, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}/items/{itemId}")]
    public async Task<IActionResult> RemoveItem(int id, int itemId)
    {
        var result = await _orderService.RemoveItemAsync(id, itemId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> Complete(int id, [FromBody] CompleteOrderRequest request)
    {
        var result = await _orderService.CompleteAsync(id, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id, [FromBody] CancelOrderRequest? request)
    {
        var result = await _orderService.CancelAsync(id, request?.Reason);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Process a full or partial refund for a completed order.
    /// Restores stock and updates order status.
    /// </summary>
    [HttpPost("{id}/refund")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Refund(int id, [FromBody] RefundRequest request)
    {
        // For full refund (no items), reason is required
        var isPartialRefund = request?.Items != null && request.Items.Count > 0;
        if (!isPartialRefund && string.IsNullOrWhiteSpace(request?.Reason))
            return BadRequest(new { Success = false, Message = "سبب الاسترجاع مطلوب للاسترجاع الكامل" });

        var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
        
        // Convert to service model
        var refundItems = request?.Items?.Select(i => new Application.DTOs.RefundItemDto
        {
            ItemId = i.ItemId,
            Quantity = i.Quantity,
            Reason = i.Reason
        }).ToList();
        
        var result = await _orderService.RefundAsync(id, userId, request?.Reason, refundItems);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}

public class CancelOrderRequest
{
    public string? Reason { get; set; }
}

/// <summary>
/// Request to process a refund (full or partial)
/// </summary>
public class RefundRequest
{
    /// <summary>
    /// General reason for the refund (required for full refund, optional for partial)
    /// </summary>
    public string? Reason { get; set; }
    
    /// <summary>
    /// Items to refund. If null or empty, performs a full refund.
    /// </summary>
    public List<RefundItemRequest>? Items { get; set; }
}

/// <summary>
/// A single item to refund in a partial refund
/// </summary>
public class RefundItemRequest
{
    /// <summary>
    /// The order item ID to refund
    /// </summary>
    public int ItemId { get; set; }
    
    /// <summary>
    /// Quantity to refund (must be <= original quantity)
    /// </summary>
    public int Quantity { get; set; }
    
    /// <summary>
    /// Reason for refunding this specific item (optional)
    /// </summary>
    public string? Reason { get; set; }
}
