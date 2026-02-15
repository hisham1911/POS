using System;
using System.Collections.Generic;

namespace KasserPro.API.TempModels;

public partial class ExpenseAttachment
{
    public int Id { get; set; }

    public int ExpenseId { get; set; }

    public string FileName { get; set; } = null!;

    public string FilePath { get; set; } = null!;

    public int FileSize { get; set; }

    public string FileType { get; set; } = null!;

    public int UploadedByUserId { get; set; }

    public string UploadedByUserName { get; set; } = null!;

    public string CreatedAt { get; set; } = null!;

    public string? UpdatedAt { get; set; }

    public int IsDeleted { get; set; }

    public virtual Expense Expense { get; set; } = null!;

    public virtual User UploadedByUser { get; set; } = null!;
}
