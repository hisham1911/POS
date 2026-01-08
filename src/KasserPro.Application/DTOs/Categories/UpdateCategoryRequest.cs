namespace KasserPro.Application.DTOs.Categories;

/// <summary>
/// Request DTO for updating a category.
/// Includes IsActive field to prevent the "false default" bug.
/// </summary>
public class UpdateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; } = 0;
    
    /// <summary>
    /// Category active status. Must be explicitly set to prevent accidental deactivation.
    /// </summary>
    public bool IsActive { get; set; } = true;
}
