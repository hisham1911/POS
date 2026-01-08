namespace KasserPro.Application.Services.Implementations;

using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Tenants;
using KasserPro.Application.Services.Interfaces;

public class TenantService : ITenantService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public TenantService(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<TenantDto>> GetCurrentTenantAsync()
    {
        var tenant = await _unitOfWork.Tenants.GetByIdAsync(_currentUser.TenantId);
        if (tenant == null)
            return ApiResponse<TenantDto>.Fail("الشركة غير موجودة");

        return ApiResponse<TenantDto>.Ok(MapToDto(tenant));
    }

    public async Task<ApiResponse<TenantDto>> UpdateCurrentTenantAsync(UpdateTenantDto dto)
    {
        var tenant = await _unitOfWork.Tenants.GetByIdAsync(_currentUser.TenantId);
        if (tenant == null)
            return ApiResponse<TenantDto>.Fail("الشركة غير موجودة");

        // Update basic info
        tenant.Name = dto.Name;
        tenant.NameEn = dto.NameEn;
        tenant.LogoUrl = dto.LogoUrl;
        tenant.Currency = dto.Currency;
        tenant.Timezone = dto.Timezone;
        
        // Update tax settings if provided
        if (dto.TaxRate.HasValue)
        {
            // Validate tax rate (0-100)
            if (dto.TaxRate.Value < 0 || dto.TaxRate.Value > 100)
                return ApiResponse<TenantDto>.Fail("نسبة الضريبة يجب أن تكون بين 0 و 100");
            
            tenant.TaxRate = dto.TaxRate.Value;
        }
        
        if (dto.IsTaxEnabled.HasValue)
        {
            tenant.IsTaxEnabled = dto.IsTaxEnabled.Value;
        }
        
        // Update inventory settings if provided
        if (dto.AllowNegativeStock.HasValue)
        {
            tenant.AllowNegativeStock = dto.AllowNegativeStock.Value;
        }

        _unitOfWork.Tenants.Update(tenant);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<TenantDto>.Ok(MapToDto(tenant), "تم تحديث بيانات الشركة بنجاح");
    }
    
    private static TenantDto MapToDto(Domain.Entities.Tenant tenant) => new()
    {
        Id = tenant.Id,
        Name = tenant.Name,
        NameEn = tenant.NameEn,
        Slug = tenant.Slug,
        LogoUrl = tenant.LogoUrl,
        Currency = tenant.Currency,
        Timezone = tenant.Timezone,
        IsActive = tenant.IsActive,
        TaxRate = tenant.TaxRate,
        IsTaxEnabled = tenant.IsTaxEnabled,
        AllowNegativeStock = tenant.AllowNegativeStock,
        CreatedAt = tenant.CreatedAt
    };
}
