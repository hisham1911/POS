namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Products;

public interface IProductService
{
    Task<ApiResponse<List<ProductDto>>> GetAllAsync();
    Task<ApiResponse<ProductDto>> GetByIdAsync(int id);
    Task<ApiResponse<List<ProductDto>>> GetByCategoryAsync(int categoryId);
    Task<ApiResponse<ProductDto>> CreateAsync(CreateProductRequest request);
    Task<ApiResponse<ProductDto>> UpdateAsync(int id, UpdateProductRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}
