namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Suppliers;

public interface ISupplierService
{
    Task<ApiResponse<List<SupplierDto>>> GetAllAsync();
    Task<ApiResponse<SupplierDto>> GetByIdAsync(int id);
    Task<ApiResponse<SupplierDto>> CreateAsync(CreateSupplierRequest request);
    Task<ApiResponse<SupplierDto>> UpdateAsync(int id, UpdateSupplierRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}
