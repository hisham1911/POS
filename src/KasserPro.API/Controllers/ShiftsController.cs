namespace KasserPro.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KasserPro.Application.DTOs.Shifts;
using KasserPro.Application.Services.Interfaces;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ShiftsController : ControllerBase
{
    private readonly IShiftService _shiftService;

    public ShiftsController(IShiftService shiftService) => _shiftService = shiftService;

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrent()
    {
        var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
        var result = await _shiftService.GetCurrentAsync(userId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost("open")]
    public async Task<IActionResult> Open([FromBody] OpenShiftRequest request)
    {
        var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
        var result = await _shiftService.OpenAsync(request, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("close")]
    public async Task<IActionResult> Close([FromBody] CloseShiftRequest request)
    {
        var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
        var result = await _shiftService.CloseAsync(request, userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
        var result = await _shiftService.GetUserShiftsAsync(userId);
        return Ok(result);
    }
}
