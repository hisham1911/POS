namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Tenants;

public interface ITenantService
{
    Task<ApiResponse<TenantDto>> GetCurrentTenantAsync();
    Task<ApiResponse<TenantDto>> UpdateCurrentTenantAsync(UpdateTenantDto dto);
}
