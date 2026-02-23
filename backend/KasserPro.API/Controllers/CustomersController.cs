namespace KasserPro.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KasserPro.Application.DTOs.Customers;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Enums;
using KasserPro.API.Middleware;

/// <summary>
/// Customer management endpoints
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService) 
        => _customerService = customerService;

    /// <summary>
    /// Get all customers with pagination and optional search
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Items per page (default: 20)</param>
    /// <param name="search">Search by phone, name, or email</param>
    [HttpGet]
    [HasPermission(Permission.CustomersView)]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        var result = await _customerService.GetAllAsync(page, pageSize, search);
        return Ok(new { Success = true, Data = result });
    }

    /// <summary>
    /// Get customer by ID
    /// </summary>
    [HttpGet("{id}")]
    [HasPermission(Permission.CustomersView)]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _customerService.GetByIdAsync(id);
        return result != null 
            ? Ok(new { Success = true, Data = result }) 
            : NotFound(new { Success = false, Message = "Customer not found" });
    }

    /// <summary>
    /// Get customer by phone number
    /// </summary>
    [HttpGet("by-phone/{phone}")]
    [HasPermission(Permission.CustomersView)]
    public async Task<IActionResult> GetByPhone(string phone)
    {
        var result = await _customerService.GetByPhoneAsync(phone);
        return result != null 
            ? Ok(new { Success = true, Data = result }) 
            : NotFound(new { Success = false, Message = "Customer not found" });
    }

    /// <summary>
    /// Create a new customer
    /// </summary>
    [HttpPost]
    [HasPermission(Permission.CustomersManage)]
    public async Task<IActionResult> Create([FromBody] CreateCustomerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Phone))
            return BadRequest(new { Success = false, Message = "Phone number is required" });

        try
        {
            var result = await _customerService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, new { Success = true, Data = result });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { Success = false, Message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Success = false, Message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing customer
    /// </summary>
    [HttpPut("{id}")]
    [HasPermission(Permission.CustomersManage)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCustomerRequest request)
    {
        var result = await _customerService.UpdateAsync(id, request);
        return result != null 
            ? Ok(new { Success = true, Data = result }) 
            : NotFound(new { Success = false, Message = "Customer not found" });
    }

    /// <summary>
    /// Get or create customer by phone (auto-create if not exists)
    /// Used during POS checkout flow
    /// </summary>
    [HttpPost("get-or-create")]
    public async Task<IActionResult> GetOrCreate([FromBody] GetOrCreateCustomerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Phone))
            return BadRequest(new { Success = false, Message = "Phone number is required" });

        try
        {
            var (customer, wasCreated) = await _customerService.GetOrCreateByPhoneAsync(request.Phone, request.Name);
            return Ok(new { 
                Success = true, 
                Data = customer, 
                WasCreated = wasCreated,
                Message = wasCreated ? "New customer created" : "Existing customer found"
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Success = false, Message = ex.Message });
        }
    }

    /// <summary>
    /// Add loyalty points to customer
    /// </summary>
    [HttpPost("{id}/loyalty/add")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> AddLoyaltyPoints(int id, [FromBody] LoyaltyPointsRequest request)
    {
        if (request.Points <= 0)
            return BadRequest(new { Success = false, Message = "Points must be positive" });

        await _customerService.AddLoyaltyPointsAsync(id, request.Points);
        return Ok(new { Success = true, Message = $"Added {request.Points} loyalty points" });
    }

    /// <summary>
    /// Redeem loyalty points from customer
    /// </summary>
    [HttpPost("{id}/loyalty/redeem")]
    public async Task<IActionResult> RedeemLoyaltyPoints(int id, [FromBody] LoyaltyPointsRequest request)
    {
        if (request.Points <= 0)
            return BadRequest(new { Success = false, Message = "Points must be positive" });

        var success = await _customerService.RedeemLoyaltyPointsAsync(id, request.Points);
        return success 
            ? Ok(new { Success = true, Message = $"Redeemed {request.Points} loyalty points" })
            : BadRequest(new { Success = false, Message = "Insufficient loyalty points" });
    }

    /// <summary>
    /// Delete (soft) a customer
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    [HasPermission(Permission.CustomersManage)]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _customerService.DeleteAsync(id);
        return success 
            ? Ok(new { Success = true, Message = "Customer deleted" })
            : NotFound(new { Success = false, Message = "Customer not found" });
    }
}

/// <summary>
/// Request to get or create customer by phone
/// </summary>
public class GetOrCreateCustomerRequest
{
    public string Phone { get; set; } = string.Empty;
    public string? Name { get; set; }
}

/// <summary>
/// Request for loyalty points operations
/// </summary>
public class LoyaltyPointsRequest
{
    public int Points { get; set; }
}
