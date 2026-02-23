using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using KasserPro.Domain.Enums;
using System.Security.Claims;

namespace KasserPro.API.Middleware;

/// <summary>
/// Authorization attribute to check specific permission.
/// Admins/SystemOwners bypass automatically.
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class HasPermissionAttribute : TypeFilterAttribute
{
    public HasPermissionAttribute(Permission permission)
        : base(typeof(HasPermissionFilter))
    {
        Arguments = new object[] { permission };
    }
}

public class HasPermissionFilter : IAsyncAuthorizationFilter
{
    private readonly Permission _permission;

    public HasPermissionFilter(Permission permission)
    {
        _permission = permission;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;

        // Not authenticated
        if (!user.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // Admin & SystemOwner bypass all permission checks
        var role = user.FindFirst(ClaimTypes.Role)?.Value;
        if (role == "Admin" || role == "SystemOwner")
            return;

        // Check permission in JWT claims
        var permissions = user.FindAll("permission")
            .Select(c => c.Value)
            .ToList();

        if (!permissions.Contains(_permission.ToString()))
        {
            context.Result = new ForbidResult();
            return;
        }

        await Task.CompletedTask;
    }
}
