namespace KasserPro.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KasserPro.Application.Common.Interfaces;

/// <summary>
/// Temporary debug controller - DELETE after debugging
/// </summary>
[ApiController]
[Route("api/debug")]
[AllowAnonymous] // Temporary for debugging - DELETE after use
public class DebugController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public DebugController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Get last 5 orders with ShiftId and Status for debugging
    /// </summary>
    [HttpGet("orders")]
    public async Task<IActionResult> GetRecentOrders()
    {
        var orders = await _unitOfWork.Orders.Query()
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new
            {
                o.Id,
                o.OrderNumber,
                o.ShiftId,
                Status = o.Status.ToString(),
                o.Total,
                o.CreatedAt,
                o.CompletedAt,
                o.BranchId,
                o.UserId
            })
            .ToListAsync();

        return Ok(new { orders, message = "Check ShiftId and Status values" });
    }

    /// <summary>
    /// Get current open shifts for debugging
    /// </summary>
    [HttpGet("shifts")]
    public async Task<IActionResult> GetOpenShifts()
    {
        var shifts = await _unitOfWork.Shifts.Query()
            .Where(s => !s.IsClosed)
            .Select(s => new
            {
                s.Id,
                s.UserId,
                s.BranchId,
                s.TenantId,
                s.OpenedAt,
                OrderCount = s.Orders.Count
            })
            .ToListAsync();

        return Ok(new { shifts, message = "Open shifts with order counts" });
    }
}
