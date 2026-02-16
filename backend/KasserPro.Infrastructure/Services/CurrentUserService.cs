namespace KasserPro.Infrastructure.Services;

using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using KasserPro.Application.Common.Interfaces;

/// <summary>
/// Implementation of ICurrentUserService that extracts user context from JWT claims
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public int UserId
    {
        get
        {
            var claim = User?.FindFirst("userId") ?? User?.FindFirst(ClaimTypes.NameIdentifier);
            return int.TryParse(claim?.Value, out var id) ? id : 0;
        }
    }

    public int TenantId
    {
        get
        {
            // Try JWT claim first
            var claim = User?.FindFirst("tenantId");
            if (claim != null && int.TryParse(claim.Value, out var id))
                return id;

            // No tenant claim (e.g., SystemOwner)
            return 0;
        }
    }

    public int BranchId
    {
        get
        {
            // Try X-Branch-Id header first (allows branch switching)
            var headerValue = _httpContextAccessor.HttpContext?.Request.Headers["X-Branch-Id"].FirstOrDefault();
            if (!string.IsNullOrEmpty(headerValue) && int.TryParse(headerValue, out var headerId))
                return headerId;

            // Fall back to JWT claim
            var claim = User?.FindFirst("branchId");
            if (claim != null && int.TryParse(claim.Value, out var claimId))
                return claimId;

            // No branch claim (e.g., SystemOwner)
            return 0;
        }
    }

    public string? Email => User?.FindFirst(ClaimTypes.Email)?.Value
                         ?? User?.FindFirst("email")?.Value;

    public string? Role => User?.FindFirst(ClaimTypes.Role)?.Value
                        ?? User?.FindFirst("role")?.Value;
}
