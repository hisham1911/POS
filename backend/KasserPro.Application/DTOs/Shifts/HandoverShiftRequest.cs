using System.ComponentModel.DataAnnotations;

namespace KasserPro.Application.DTOs.Shifts;

/// <summary>
/// Request to handover a shift to another user
/// </summary>
public class HandoverShiftRequest
{
    /// <summary>
    /// User ID to handover the shift to (required)
    /// </summary>
    [Required(ErrorMessage = "يجب اختيار المستخدم المستلم")]
    [Range(1, int.MaxValue, ErrorMessage = "معرف المستخدم غير صحيح")]
    public int ToUserId { get; set; }
    
    /// <summary>
    /// Notes about the handover (optional)
    /// </summary>
    [StringLength(1000, ErrorMessage = "الملاحظات يجب ألا تتجاوز 1000 حرف")]
    public string? Notes { get; set; }
    
    /// <summary>
    /// Current balance at handover time
    /// </summary>
    public decimal CurrentBalance { get; set; }
}
