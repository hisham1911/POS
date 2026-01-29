namespace KasserPro.Application.DTOs.PurchaseInvoices;

public class CancelInvoiceRequest
{
    public string Reason { get; set; } = string.Empty;
    public bool AdjustInventory { get; set; } = false;
}
