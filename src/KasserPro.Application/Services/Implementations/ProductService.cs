namespace KasserPro.Application.Services.Implementations;

using Microsoft.EntityFrameworkCore;
using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Products;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Entities;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;

    public ProductService(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<ApiResponse<List<ProductDto>>> GetAllAsync()
    {
        var products = await _unitOfWork.Products.Query()
            .Include(p => p.Category)
            .Where(p => p.IsActive)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                NameEn = p.NameEn,
                Description = p.Description,
                Sku = p.Sku,
                Barcode = p.Barcode,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                IsActive = p.IsActive,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name
            })
            .ToListAsync();

        return ApiResponse<List<ProductDto>>.Ok(products);
    }

    public async Task<ApiResponse<ProductDto>> GetByIdAsync(int id)
    {
        var product = await _unitOfWork.Products.Query()
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return ApiResponse<ProductDto>.Fail("المنتج غير موجود");

        return ApiResponse<ProductDto>.Ok(new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            NameEn = product.NameEn,
            Description = product.Description,
            Price = product.Price,
            CategoryId = product.CategoryId,
            CategoryName = product.Category.Name,
            IsActive = product.IsActive
        });
    }

    public async Task<ApiResponse<List<ProductDto>>> GetByCategoryAsync(int categoryId)
    {
        var products = await _unitOfWork.Products.Query()
            .Where(p => p.CategoryId == categoryId && p.IsActive)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                CategoryId = p.CategoryId
            })
            .ToListAsync();

        return ApiResponse<List<ProductDto>>.Ok(products);
    }

    public async Task<ApiResponse<ProductDto>> CreateAsync(CreateProductRequest request)
    {
        var product = new Product
        {
            Name = request.Name,
            NameEn = request.NameEn,
            Description = request.Description,
            Sku = request.Sku,
            Barcode = request.Barcode,
            Price = request.Price,
            Cost = request.Cost,
            ImageUrl = request.ImageUrl,
            CategoryId = request.CategoryId
        };

        await _unitOfWork.Products.AddAsync(product);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<ProductDto>.Ok(new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Price = product.Price,
            CategoryId = product.CategoryId
        }, "تم إنشاء المنتج بنجاح");
    }

    public async Task<ApiResponse<ProductDto>> UpdateAsync(int id, UpdateProductRequest request)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null)
            return ApiResponse<ProductDto>.Fail("المنتج غير موجود");

        product.Name = request.Name;
        product.NameEn = request.NameEn;
        product.Description = request.Description;
        product.Sku = request.Sku;
        product.Barcode = request.Barcode;
        product.Price = request.Price;
        product.Cost = request.Cost;
        product.ImageUrl = request.ImageUrl;
        product.IsActive = request.IsActive;
        product.CategoryId = request.CategoryId;

        _unitOfWork.Products.Update(product);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<ProductDto>.Ok(new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Price = product.Price
        }, "تم تحديث المنتج بنجاح");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null)
            return ApiResponse<bool>.Fail("المنتج غير موجود");

        product.IsDeleted = true;
        _unitOfWork.Products.Update(product);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "تم حذف المنتج بنجاح");
    }
}
