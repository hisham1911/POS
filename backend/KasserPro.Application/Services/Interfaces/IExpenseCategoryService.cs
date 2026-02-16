using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Expenses;

namespace KasserPro.Application.Services.Interfaces;

/// <summary>
/// Service interface for Expense Category management
/// </summary>
public interface IExpenseCategoryService
{
    /// <summary>
    /// Get all expense categories
    /// </summary>
    Task<ApiResponse<List<ExpenseCategoryDto>>> GetAllAsync(bool includeInactive = false);
    
    /// <summary>
    /// Get expense category by ID
    /// </summary>
    Task<ApiResponse<ExpenseCategoryDto>> GetByIdAsync(int id);
    
    /// <summary>
    /// Create a new expense category
    /// </summary>
    Task<ApiResponse<ExpenseCategoryDto>> CreateAsync(CreateExpenseCategoryRequest request);
    
    /// <summary>
    /// Update an expense category
    /// </summary>
    Task<ApiResponse<ExpenseCategoryDto>> UpdateAsync(int id, UpdateExpenseCategoryRequest request);
    
    /// <summary>
    /// Delete an expense category (soft delete, cannot delete system categories)
    /// </summary>
    Task<ApiResponse<bool>> DeleteAsync(int id);
    
    /// <summary>
    /// Seed default expense categories
    /// </summary>
    Task SeedDefaultCategoriesAsync();
}
