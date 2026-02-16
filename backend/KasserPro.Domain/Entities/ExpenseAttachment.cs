namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

/// <summary>
/// File attachment for an expense (receipt, invoice, etc.)
/// </summary>
public class ExpenseAttachment : BaseEntity
{
    public int ExpenseId { get; set; }
    
    /// <summary>
    /// Original file name
    /// </summary>
    public string FileName { get; set; } = string.Empty;
    
    /// <summary>
    /// Relative path to the file (from uploads root)
    /// </summary>
    public string FilePath { get; set; } = string.Empty;
    
    /// <summary>
    /// File size in bytes
    /// </summary>
    public long FileSize { get; set; }
    
    /// <summary>
    /// MIME type (e.g., "image/jpeg", "application/pdf")
    /// </summary>
    public string FileType { get; set; } = string.Empty;
    
    // Audit trail
    public int UploadedByUserId { get; set; }
    public string UploadedByUserName { get; set; } = string.Empty;
    
    // Navigation properties
    public Expense Expense { get; set; } = null!;
    public User UploadedByUser { get; set; } = null!;
}
