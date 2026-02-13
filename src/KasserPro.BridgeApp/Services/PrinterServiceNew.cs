using KasserPro.BridgeApp.Models;
using System.Diagnostics;
using System.Printing;
using System.IO;
using Serilog;

namespace KasserPro.BridgeApp.Services;

/// <summary>
/// Simplified printer service using HTML-based printing
/// Instead of drawing with GDI+, we generate HTML and print it
/// This matches the approach used in the Kasser-Pro-Demo reference app
/// </summary>
public class SimplePrinterService : IPrinterService
{
    private readonly ISettingsManager _settingsManager;

    public SimplePrinterService(ISettingsManager settingsManager)
    {
        _settingsManager = settingsManager;
    }

    /// <summary>
    /// Initialize printer service
    /// </summary>
    public Task InitializeAsync()
    {
        Log.Information("SimplePrinterService initialized");
        return Task.CompletedTask;
    }

    /// <summary>
    /// Get list of available printers
    /// </summary>
    public Task<List<string>> GetAvailablePrintersAsync()
    {
        try
        {
            var printers = new List<string>();
            var localPrintServer = new LocalPrintServer();
            var printQueues = localPrintServer.GetPrintQueues();

            foreach (var printer in printQueues)
            {
                printers.Add(printer.FullName);
            }

            return Task.FromResult(printers);
        }
        catch (Exception ex)
        {
            Log.Error($"Error getting printers: {ex.Message}");
            return Task.FromResult(new List<string>());
        }
    }

    /// <summary>
    /// Print receipt using HTML (browser-based printing)
    /// </summary>
    public async Task<bool> PrintReceiptAsync(PrintCommandDto command)
    {
        try
        {
            var settings = await _settingsManager.GetSettingsAsync();

            // Generate HTML receipt using server settings
            string html = GenerateReceiptHtml(command.Receipt, command.Settings);

            // Save to temporary file
            string tempFile = Path.Combine(Path.GetTempPath(), $"receipt_{DateTime.Now:yyyyMMdd_HHmmss}.html");
            await File.WriteAllTextAsync(tempFile, html);

            // Open in default browser (which triggers print dialog)
            ProcessStartInfo psi = new ProcessStartInfo
            {
                FileName = tempFile,
                UseShellExecute = true
            };

            Process.Start(psi);

            Log.Information($"Receipt printed successfully. File: {tempFile}");
            return true;
        }
        catch (Exception ex)
        {
            Log.Error($"Error printing receipt: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Generate receipt HTML using server settings
    /// </summary>
    private string GenerateReceiptHtml(ReceiptDto receipt, ReceiptPrintSettings rs)
    {
        // Calculate totals
        decimal subtotal = receipt.Items.Sum(i => i.TotalPrice);
        decimal discount = receipt.TotalAmount < subtotal ? subtotal - receipt.TotalAmount : 0;
        decimal taxAmount = receipt.TaxAmount;
        decimal total = receipt.TotalAmount;

        // Paper width
        string paperMaxWidth = rs.PaperSize switch
        {
            "58mm" => "219px",
            "custom" => $"{rs.CustomWidth ?? 280}px",
            _ => "302px"
        };

        // Get payment method in Arabic
        string paymentMethodAr = receipt.PaymentMethod switch
        {
            "cash" or "Cash" => "💵 كاش",
            "card" or "Card" => "💳 بطاقة",
            "wallet" or "Wallet" => "📱 محفظة",
            _ => receipt.PaymentMethod
        };

        // Format date
        string formattedDate = receipt.Date.ToString("dd/MM/yyyy hh:mm tt", new System.Globalization.CultureInfo("ar-EG"));

        // Generate item rows
        string itemsHtml = string.Join("", receipt.Items.Select(item => $@"
            <div class='item'>
              <span>{item.Name} × {item.Quantity:F0}</span>
              <span>{item.TotalPrice:F0} ج.م</span>
            </div>
        "));

        // Logo HTML
        string logoHtml = rs.ShowLogo && !string.IsNullOrEmpty(rs.LogoUrl)
            ? $"<img src='{rs.LogoUrl}' style='max-height:60px; max-width:60%; margin:0 auto; display:block;' />"
            : "";

        // Branch name HTML
        string branchHtml = rs.ShowBranchName
            ? $"<h2 style='font-size:{rs.HeaderFontSize}px; margin:0'>{receipt.BranchName}</h2>"
            : "";

        // Cashier + Payment on same line
        string cashierPaymentHtml = rs.ShowCashier
            ? $"<div class='item' style='font-size:{rs.BodyFontSize}px'><span>الكاشير: {receipt.CashierName}</span><span>الدفع: {paymentMethodAr}</span></div>"
            : $"<div class='item' style='font-size:{rs.BodyFontSize}px'><span>الدفع: {paymentMethodAr}</span><span></span></div>";

        // Customer HTML
        string customerHtml = rs.ShowCustomerName && !string.IsNullOrEmpty(receipt.CustomerName)
            ? $"<div class='item' style='font-size:{rs.BodyFontSize}px'><span>العميل: {receipt.CustomerName}</span><span></span></div>"
            : "";

        // Tax HTML with percentage
        string taxHtml = taxAmount > 0 && rs.IsTaxEnabled
            ? $"<div class='item'><span>الضريبة ({rs.TaxRate:F0}%)</span><span>{taxAmount:F2} ج.م</span></div>"
            : "";

        // Footer HTML
        string footerHtml = rs.ShowThankYou
            ? "<p style='text-align:center; margin-top:20px'>شكراً لزيارتكم ✨</p>"
            : "";

        string footerMessageHtml = !string.IsNullOrEmpty(rs.FooterMessage)
            ? $"<p style='text-align:center; font-size:{Math.Max(rs.BodyFontSize - 1, 7)}px'>{rs.FooterMessage}</p>"
            : "";

        string phoneHtml = !string.IsNullOrEmpty(rs.PhoneNumber)
            ? $"<p style='text-align:center; font-size:{Math.Max(rs.BodyFontSize - 1, 7)}px'>{rs.PhoneNumber}</p>"
            : "";

        // Build complete HTML
        string html = $@"
<!DOCTYPE html>
<html dir='rtl'>
<head>
    <meta charset='UTF-8'>
    <title>فاتورة #{receipt.ReceiptNumber}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            padding: 20px;
            font-size: {rs.BodyFontSize}px;
            max-width: {paperMaxWidth};
            margin: 0 auto;
        }}
        .header {{
            text-align: center;
            margin-bottom: 20px;
        }}
        .line {{
            border-top: 1px dashed #000;
            margin: 10px 0;
        }}
        .item {{
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
        }}
        .total {{
            font-weight: bold;
            font-size: {rs.TotalFontSize}px;
        }}
    </style>
</head>
<body>
    <div class='header'>
        {logoHtml}
        {branchHtml}
        <div class='item' style='font-size:{rs.BodyFontSize}px'><span>فاتورة رقم</span><span>{receipt.ReceiptNumber}</span></div>
        <p style='font-size:{rs.BodyFontSize}px'>{formattedDate}</p>
    </div>
    <div class='line'></div>
    {cashierPaymentHtml}
    {customerHtml}
    <div class='line'></div>
    {itemsHtml}
    <div class='line'></div>
    <div class='item'><span>المجموع</span><span>{subtotal:F2} ج.م</span></div>
    {(discount > 0 ? $"<div class='item'><span>الخصم</span><span>-{discount:F2} ج.م</span></div>" : "")}
    {taxHtml}
    <div class='line'></div>
    <div class='item total'><span>الإجمالي</span><span>{total:F2} ج.م</span></div>
    {(receipt.AmountPaid > 0 ? $@"
    <div class='line'></div>
    <div class='item'><span>المبلغ المدفوع</span><span>{receipt.AmountPaid:F2} ج.م</span></div>
    {(receipt.ChangeAmount > 0 ? $"<div class='item'><span>الباقي</span><span>{receipt.ChangeAmount:F2} ج.م</span></div>" : "")}
    {(receipt.AmountDue > 0 ? $"<div class='item total' style='color:red'><span>المتبقي على العميل</span><span>{receipt.AmountDue:F2} ج.م</span></div>" : "")}
    " : "")}
    {footerHtml}
    {footerMessageHtml}
    {phoneHtml}
</body>
</html>
";

        return html;
    }
}
