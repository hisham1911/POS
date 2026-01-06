namespace KasserPro.Application.Services.Implementations;

using Microsoft.EntityFrameworkCore;
using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs.Categories;
using KasserPro.Application.DTOs.Common;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Entities;

public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public CategoryService(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<ApiResponse<List<CategoryDto>>> GetAllAsync()
    {
        var categories = await _unitOfWork.Categories.Query()
            .Include(c => c.Products)
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                NameEn = c.NameEn,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                SortOrder = c.SortOrder,
                IsActive = c.IsActive,
                ProductCount = c.Products.Count(p => !p.IsDeleted)
            })
            .ToListAsync();

        return ApiResponse<List<CategoryDto>>.Ok(categories);
    }

    public async Task<ApiResponse<CategoryDto>> GetByIdAsync(int id)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        if (category == null)
            return ApiResponse<CategoryDto>.Fail("التصنيف غير موجود");

        return ApiResponse<CategoryDto>.Ok(new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            NameEn = category.NameEn,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            SortOrder = category.SortOrder,
            IsActive = category.IsActive
        });
    }

    public async Task<ApiResponse<CategoryDto>> CreateAsync(CreateCategoryRequest request)
    {
        var category = new Category
        {
            Name = request.Name,
            NameEn = request.NameEn,
            Description = request.Description,
            ImageUrl = request.ImageUrl,
            SortOrder = request.SortOrder
        };

        await _unitOfWork.Categories.AddAsync(category);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<CategoryDto>.Ok(new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            NameEn = category.NameEn,
            SortOrder = category.SortOrder,
            IsActive = category.IsActive
        }, "تم إنشاء التصنيف بنجاح");
    }

    public async Task<ApiResponse<CategoryDto>> UpdateAsync(int id, CreateCategoryRequest request)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        if (category == null)
            return ApiResponse<CategoryDto>.Fail("التصنيف غير موجود");

        category.Name = request.Name;
        category.NameEn = request.NameEn;
        category.Description = request.Description;
        category.ImageUrl = request.ImageUrl;
        category.SortOrder = request.SortOrder;

        _unitOfWork.Categories.Update(category);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<CategoryDto>.Ok(new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            NameEn = category.NameEn,
            SortOrder = category.SortOrder,
            IsActive = category.IsActive
        }, "تم تحديث التصنيف بنجاح");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        if (category == null)
            return ApiResponse<bool>.Fail("التصنيف غير موجود");

        category.IsDeleted = true;
        _unitOfWork.Categories.Update(category);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "تم حذف التصنيف بنجاح");
    }
}
