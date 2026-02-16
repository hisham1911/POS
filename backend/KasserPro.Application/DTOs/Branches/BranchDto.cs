namespace KasserPro.Application.DTOs.Branches;

public class BranchDto
{
    public int Id { get; set; }
    public int TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public decimal DefaultTaxRate { get; set; }
    public bool DefaultTaxInclusive { get; set; }
    public string CurrencyCode { get; set; } = "EGP";
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateBranchDto
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
}

public class UpdateBranchDto
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; }
}
