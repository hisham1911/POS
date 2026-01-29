namespace KasserPro.Application.DTOs.PurchaseInvoices;

using System.ComponentModel.DataAnnotations;
using KasserPro.Domain.Enums;

public class AddPaymentRequest
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }
    
    [Required]
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    
    [Required]
    public PaymentMethod Method { get; set; }
    
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
}
