namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Tenants;
using KasserPro.Application.DTOs.System;

public interface ITenantService
{
    Task<ApiResponse<TenantDto>> GetCurrentTenantAsync();
    Task<ApiResponse<TenantDto>> UpdateCurrentTenantAsync(UpdateTenantDto dto);
    Task<ApiResponse<CreateTenantResponse>> CreateTenantWithAdminAsync(CreateTenantRequest request);
    Task<ApiResponse<List<SystemTenantSummaryDto>>> GetAllTenantsForSystemOwnerAsync();
    Task<ApiResponse<bool>> SetTenantActiveStatusAsync(int tenantId, bool isActive);
}
