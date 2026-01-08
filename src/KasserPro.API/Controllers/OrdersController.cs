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
    public async Task<IActionResult> GetAllOrders()
    {
        var result = await _orderService.GetTodayOrdersAsync();
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
}

public class CancelOrderRequest
{
    public string? Reason { get; set; }
}
