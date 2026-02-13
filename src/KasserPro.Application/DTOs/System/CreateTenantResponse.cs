namespace KasserPro.Application.DTOs.System;

public class CreateTenantResponse
{
    public int TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public string TenantSlug { get; set; } = string.Empty;
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int AdminUserId { get; set; }
    public string AdminEmail { get; set; } = string.Empty;
}
