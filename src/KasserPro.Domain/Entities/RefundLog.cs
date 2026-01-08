namespace KasserPro.Domain.Entities;

using System.ComponentModel.DataAnnotations;
using KasserPro.Domain.Common;

/// <summary>
/// Audit log for refund transactions.
/// Stores details of what was refunded and stock changes made.
/// </summary>
public class RefundLog : BaseEntity
{
    public int TenantId { get; set; }
    public int BranchId { get; set; }
    public int OrderId { get; set; }
    public int UserId { get; set; }
    
    /// <summary>
    /// Total amount refunded
    /// </summary>
    public decimal RefundAmount { get; set; }
    
    /// <summary>
    /// Reason for the refund (required)
    /// </summary>
    [Required]
    [MaxLength(500)]
    public string Reason { get; set; } = string.Empty;
    
    /// <summary>
    /// JSON array of stock changes made during refund.
    /// Format: [{"ProductId": 1, "Quantity": 2, "BalanceBefore": 5, "BalanceAfter": 7}, ...]
    /// </summary>
    public string? StockChangesJson { get; set; }
    
    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public Order Order { get; set; } = null!;
    public User User { get; set; } = null!;
}
