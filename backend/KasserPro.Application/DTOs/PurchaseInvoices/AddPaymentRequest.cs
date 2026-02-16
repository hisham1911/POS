namespace KasserPro.Application.DTOs.PurchaseInvoices;

using KasserPro.Domain.Enums;

public class AddPaymentRequest
{
    [global::System.ComponentModel.DataAnnotations.Required]
    [global::System.ComponentModel.DataAnnotations.Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }
    
    [global::System.ComponentModel.DataAnnotations.Required]
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    
    [global::System.ComponentModel.DataAnnotations.Required]
    public PaymentMethod Method { get; set; }
    
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
}
