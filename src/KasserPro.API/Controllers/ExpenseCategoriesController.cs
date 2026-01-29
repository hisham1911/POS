using KasserPro.Application.DTOs.Expenses;
using KasserPro.Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KasserPro.API.Controllers;

/// <summary>
/// Controller for Expense Category management
/// </summary>
[ApiController]
[Route("api/expense-categories")]
[Authorize]
public class ExpenseCategoriesController : ControllerBase
{
    private readonly IExpenseCategoryService _expenseCategoryService;
    private readonly ILogger<ExpenseCategoriesController> _logger;

    public ExpenseCategoriesController(
        IExpenseCategoryService expenseCategoryService,
        ILogger<ExpenseCategoriesController> logger)
    {
        _expenseCategoryService = expenseCategoryService;
        _logger = logger;
    }

    /// <summary>
    /// Get all expense categories
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false)
    {
        var result = await _expenseCategoryService.GetAllAsync(includeInactive);
        
        if (!result.Success)
            return BadRequest(result);
        
        return Ok(result);
    }

    /// <summary>
    /// Seed default expense categories (Admin only)
    /// </summary>
    [HttpPost("seed")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SeedDefaultCategories()
    {
        try
        {
            await _expenseCategoryService.SeedDefaultCategoriesAsync();
            return Ok(new { success = true, message = "Default categories seeded successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding default categories");
            return BadRequest(new { success = false, message = "Failed to seed categories" });
        }
    }

    /// <summary>
    /// Get expense category by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _expenseCategoryService.GetByIdAsync(id);
        
        if (!result.Success)
            return NotFound(result);
        
        return Ok(result);
    }

    /// <summary>
    /// Create a new expense category (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateExpenseCategoryRequest request)
    {
        var result = await _expenseCategoryService.CreateAsync(request);
        
        if (!result.Success)
            return BadRequest(result);
        
        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    /// <summary>
    /// Update an expense category (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateExpenseCategoryRequest request)
    {
        var result = await _expenseCategoryService.UpdateAsync(id, request);
        
        if (!result.Success)
            return BadRequest(result);
        
        return Ok(result);
    }

    /// <summary>
    /// Delete an expense category (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _expenseCategoryService.DeleteAsync(id);
        
        if (!result.Success)
            return BadRequest(result);
        
        return Ok(result);
    }
}
