using System.ComponentModel.DataAnnotations;

namespace KasserPro.Application.DTOs.Shifts;

/// <summary>
/// Request to force close a shift (Admin only)
/// </summary>
public class ForceCloseShiftRequest
{
    /// <summary>
    /// Reason for force closing the shift (required)
    /// </summary>
    [Required(ErrorMessage = "سبب الإغلاق مطلوب")]
    [StringLength(500, ErrorMessage = "السبب يجب ألا يتجاوز 500 حرف")]
    public string Reason { get; set; } = string.Empty;
    
    /// <summary>
    /// Actual closing balance (optional, for reconciliation)
    /// </summary>
    public decimal? ActualBalance { get; set; }
    
    /// <summary>
    /// Additional notes
    /// </summary>
    [StringLength(1000, ErrorMessage = "الملاحظات يجب ألا تتجاوز 1000 حرف")]
    public string? Notes { get; set; }
}
