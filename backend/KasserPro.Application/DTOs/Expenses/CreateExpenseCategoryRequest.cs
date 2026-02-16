using System.ComponentModel.DataAnnotations;

namespace KasserPro.Application.DTOs.Expenses;

/// <summary>
/// Request DTO for creating an expense category
/// </summary>
public class CreateExpenseCategoryRequest
{
    [Required(ErrorMessage = "EXPENSE_CATEGORY_NAME_REQUIRED")]
    [StringLength(100, ErrorMessage = "EXPENSE_CATEGORY_NAME_TOO_LONG")]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(100, ErrorMessage = "EXPENSE_CATEGORY_NAME_TOO_LONG")]
    public string? NameEn { get; set; }
    
    [StringLength(500, ErrorMessage = "EXPENSE_CATEGORY_DESCRIPTION_TOO_LONG")]
    public string? Description { get; set; }
    
    [StringLength(50, ErrorMessage = "EXPENSE_CATEGORY_ICON_TOO_LONG")]
    public string? Icon { get; set; }
    
    [StringLength(20, ErrorMessage = "EXPENSE_CATEGORY_COLOR_TOO_LONG")]
    public string? Color { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public int SortOrder { get; set; } = 0;
}
