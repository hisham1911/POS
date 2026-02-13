namespace KasserPro.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using KasserPro.Application.DTOs.System;
using KasserPro.Application.Services.Interfaces;

[ApiController]
[Route("api/system")]
[Authorize]
public class SystemController : ControllerBase
{
    private readonly ITenantService _tenantService;

    public SystemController(ITenantService tenantService)
    {
        _tenantService = tenantService;
    }

    /// <summary>
    /// Create a new tenant with admin user and default branch (SystemOwner only)
    /// </summary>
    [HttpGet("tenants")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<IActionResult> GetTenants()
    {
        var result = await _tenantService.GetAllTenantsForSystemOwnerAsync();
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Activate/Deactivate a tenant (SystemOwner only)
    /// </summary>
    [HttpPatch("tenants/{tenantId:int}/status")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<IActionResult> SetTenantStatus(int tenantId, [FromBody] SetTenantStatusRequest request)
    {
        var result = await _tenantService.SetTenantActiveStatusAsync(tenantId, request.IsActive);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Create a new tenant with admin user and default branch (SystemOwner only)
    /// </summary>
    [HttpPost("tenants")]
    [Authorize(Roles = "SystemOwner")]
    [EnableRateLimiting("SystemTenantCreation")]
    public async Task<IActionResult> CreateTenant([FromBody] CreateTenantRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _tenantService.CreateTenantWithAdminAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
