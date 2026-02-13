namespace KasserPro.Application.DTOs.System;

public class SystemTenantSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int BranchesCount { get; set; }
    public int ActiveBranchesCount { get; set; }
    public int UsersCount { get; set; }
    public int ActiveUsersCount { get; set; }
    public int InactiveUsersCount { get; set; }
    public int AdminsCount { get; set; }
    public int CashiersCount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Timezone { get; set; } = string.Empty;
    public decimal TaxRate { get; set; }
    public bool IsTaxEnabled { get; set; }
    public bool AllowNegativeStock { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
