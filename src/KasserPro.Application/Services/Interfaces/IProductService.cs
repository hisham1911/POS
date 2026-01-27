namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Products;

public interface IProductService
{
    Task<ApiResponse<List<ProductDto>>> GetAllAsync(int? categoryId = null, string? search = null, bool? isActive = null, bool? lowStock = null);
    Task<ApiResponse<ProductDto>> GetByIdAsync(int id);
    Task<ApiResponse<ProductDto>> CreateAsync(CreateProductRequest request);
    Task<ApiResponse<ProductDto>> UpdateAsync(int id, UpdateProductRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}
