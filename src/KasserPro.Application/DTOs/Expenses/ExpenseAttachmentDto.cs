namespace KasserPro.Application.DTOs.Expenses;

/// <summary>
/// DTO for Expense Attachment
/// </summary>
public class ExpenseAttachmentDto
{
    public int Id { get; set; }
    public int ExpenseId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string FileType { get; set; } = string.Empty;
    public string UploadedByUserName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
