namespace KasserPro.Application.DTOs.Shifts;

public class ShiftDto
{
    public int Id { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal ClosingBalance { get; set; }
    public decimal ExpectedBalance { get; set; }
    public decimal Difference { get; set; }
    public DateTime OpenedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public bool IsClosed { get; set; }
    public string? Notes { get; set; }
    public decimal TotalCash { get; set; }
    public decimal TotalCard { get; set; }
    public int TotalOrders { get; set; }
    public string UserName { get; set; } = string.Empty;
}

public class OpenShiftRequest
{
    public decimal OpeningBalance { get; set; }
}

public class CloseShiftRequest
{
    public decimal ClosingBalance { get; set; }
    public string? Notes { get; set; }
}
