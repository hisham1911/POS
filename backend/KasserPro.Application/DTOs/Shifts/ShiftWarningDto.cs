namespace KasserPro.Application.DTOs.Shifts;

/// <summary>
/// Shift warning information
/// </summary>
public class ShiftWarningDto
{
    /// <summary>
    /// Warning level: None, Warning (12h), Critical (24h)
    /// </summary>
    public string Level { get; set; } = "None";
    
    /// <summary>
    /// Warning message
    /// </summary>
    public string Message { get; set; } = string.Empty;
    
    /// <summary>
    /// Hours the shift has been open
    /// </summary>
    public double HoursOpen { get; set; }
    
    /// <summary>
    /// Should show warning to user
    /// </summary>
    public bool ShouldWarn { get; set; }
    
    /// <summary>
    /// Is critical (24+ hours)
    /// </summary>
    public bool IsCritical { get; set; }
    
    /// <summary>
    /// Shift ID
    /// </summary>
    public int? ShiftId { get; set; }
}
