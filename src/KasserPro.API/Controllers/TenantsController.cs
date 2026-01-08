namespace KasserPro.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KasserPro.Application.DTOs.Tenants;
using KasserPro.Application.Services.Interfaces;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TenantsController : ControllerBase
{
    private readonly ITenantService _tenantService;

    public TenantsController(ITenantService tenantService) => _tenantService = tenantService;

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrent()
    {
        var result = await _tenantService.GetCurrentTenantAsync();
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPut("current")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateCurrent([FromBody] UpdateTenantDto dto)
    {
        var result = await _tenantService.UpdateCurrentTenantAsync(dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
