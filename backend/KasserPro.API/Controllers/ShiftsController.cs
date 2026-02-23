namespace KasserPro.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KasserPro.Application.DTOs.Shifts;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Enums;
using KasserPro.API.Middleware;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ShiftsController : ControllerBase
{
    private readonly IShiftService _shiftService;

    public ShiftsController(IShiftService shiftService) => _shiftService = shiftService;

    private int GetUserId()
    {
        var claim = User.FindFirst("userId");
        return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
    }

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrent()
    {
        var userId = GetUserId();
        if (userId <= 0)
            return Unauthorized(new { success = false, message = "معرف المستخدم غير صالح في التوكن" });
        
        var result = await _shiftService.GetCurrentAsync(userId);
        // Always return 200 OK, even if no shift is open (data will be null)
        return Ok(result);
    }

    [HttpPost("open")]
    public async Task<IActionResult> Open([FromBody] OpenShiftRequest request)
    {
        var userId = GetUserId();
        if (userId <= 0)
            return Unauthorized(new { success = false, message = "معرف المستخدم غير صالح في التوكن" });
        
        var result = await _shiftService.OpenAsync(request, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("close")]
    public async Task<IActionResult> Close([FromBody] CloseShiftRequest request)
    {
        var userId = GetUserId();
        if (userId <= 0)
            return Unauthorized(new { success = false, message = "معرف المستخدم غير صالح في التوكن" });
        
        var result = await _shiftService.CloseAsync(request, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var userId = GetUserId();
        if (userId <= 0)
            return Unauthorized(new { success = false, message = "معرف المستخدم غير صالح في التوكن" });
        
        var result = await _shiftService.GetUserShiftsAsync(userId);
        return Ok(result);
    }

    /// <summary>
    /// Force close a shift (Admin only)
    /// </summary>
    [HttpPost("{id}/force-close")]
    [Authorize(Roles = "Admin")]
    [HasPermission(Permission.ShiftsManage)]
    public async Task<IActionResult> ForceClose(int id, [FromBody] ForceCloseShiftRequest request)
    {
        var result = await _shiftService.ForceCloseAsync(id, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Handover shift to another user
    /// </summary>
    [HttpPost("{id}/handover")]
    public async Task<IActionResult> Handover(int id, [FromBody] HandoverShiftRequest request)
    {
        var result = await _shiftService.HandoverAsync(id, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Update last activity timestamp for a shift
    /// </summary>
    [HttpPost("{id}/update-activity")]
    public async Task<IActionResult> UpdateActivity(int id)
    {
        var result = await _shiftService.UpdateActivityAsync(id);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Get all active shifts in the current branch
    /// </summary>
    [HttpGet("active")]
    [HasPermission(Permission.ShiftsManage)]
    public async Task<IActionResult> GetActiveShifts()
    {
        var result = await _shiftService.GetActiveShiftsAsync();
        return Ok(result);
    }

    /// <summary>
    /// Get shift warnings for current user's shift
    /// </summary>
    [HttpGet("warnings")]
    public async Task<IActionResult> GetShiftWarnings()
    {
        var userId = GetUserId();
        if (userId <= 0)
            return Unauthorized(new { success = false, message = "معرف المستخدم غير صالح في التوكن" });
        
        var result = await _shiftService.GetShiftWarningsAsync(userId);
        return Ok(result);
    }
}
