namespace KasserPro.Application.Common.Interfaces;

/// <summary>
/// Service to access current authenticated user context from JWT claims
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Current user's ID from JWT claim "userId"
    /// </summary>
    int UserId { get; }
    
    /// <summary>
    /// Current user's Tenant ID from JWT claim "tenantId"
    /// </summary>
    int TenantId { get; }
    
    /// <summary>
    /// Current user's Branch ID from JWT claim "branchId" or X-Branch-Id header
    /// </summary>
    int BranchId { get; }
    
    /// <summary>
    /// Current user's email from JWT claim
    /// </summary>
    string? Email { get; }
    
    /// <summary>
    /// Current user's role from JWT claim
    /// </summary>
    string? Role { get; }
    
    /// <summary>
    /// Whether the current request is authenticated
    /// </summary>
    bool IsAuthenticated { get; }
}
