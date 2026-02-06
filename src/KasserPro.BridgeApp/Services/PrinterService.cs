using System.Drawing.Printing;
using System.Drawing;
using System.Linq;
using System.Text;
using ESCPOS_NET;
using ESCPOS_NET.Emitters;
using KasserPro.BridgeApp.Models;
using Serilog;

namespace KasserPro.BridgeApp.Services;

/// <summary>
/// Manages thermal printer operations using ESC/POS commands
/// </summary>
public class PrinterService : IPrinterService
{
    private readonly ISettingsManager _settingsManager;

    public PrinterService(ISettingsManager settingsManager)
    {
        _settingsManager = settingsManager;
    }

    /// <summary>
    /// Initializes printer service and logs available printers
    /// </summary>
    public async Task InitializeAsync()
    {
        Log.Information("Initializing printer service");
        var printers = await GetAvailablePrintersAsync();
        Log.Information("Found {Count} printers: {Printers}", printers.Count, string.Join(", ", printers));
    }

    /// <summary>
    /// Gets all installed printers from Windows
    /// </summary>
    public Task<List<string>> GetAvailablePrintersAsync()
    {
        var printers = new List<string>();
        foreach (string printerName in PrinterSettings.InstalledPrinters)
        {
            printers.Add(printerName);
        }
        return Task.FromResult(printers);
    }

    /// <summary>
    /// Prints a receipt on the configured thermal printer
    /// </summary>
    public async Task<bool> PrintReceiptAsync(ReceiptDto receipt)
    {
        try
        {
            var settings = await _settingsManager.GetSettingsAsync();
            var printerName = settings.DefaultPrinterName;

            if (string.IsNullOrEmpty(printerName))
            {
                Log.Error("No default printer configured");
                return false;
            }

            Log.Information("Printing receipt {ReceiptNumber} on printer {Printer}", 
                receipt.ReceiptNumber, printerName);

            // Check if this is a PDF printer or thermal printer
            if (IsPdfPrinter(printerName))
            {
                // Use PrintDocument for PDF printers
                await PrintUsingPrintDocumentAsync(printerName, receipt);
            }
            else
            {
                // Use ESC/POS for thermal printers
                var escPosBytes = GenerateReceiptEscPos(receipt);
                await SendToPrinterAsync(printerName, escPosBytes);
            }

            Log.Information("Receipt {ReceiptNumber} printed successfully", receipt.ReceiptNumber);
            return true;
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Failed to print receipt {ReceiptNumber}", receipt.ReceiptNumber);
            return false;
        }
    }

    /// <summary>
    /// Checks if the printer is a PDF printer
    /// </summary>
    private bool IsPdfPrinter(string printerName)
    {
        var pdfPrinters = new[] { "pdf", "xps", "onenote", "fax" };
        return pdfPrinters.Any(p => printerName.ToLower().Contains(p));
    }

    /// <summary>
    /// Prints receipt using PrintDocument (for PDF printers)
    /// </summary>
    private Task PrintUsingPrintDocumentAsync(string printerName, ReceiptDto receipt)
    {
        return Task.Run(() =>
        {
            var printDoc = new PrintDocument();
            printDoc.PrinterSettings.PrinterName = printerName;
            
            // Set paper size for thermal receipt (80mm width)
            printDoc.DefaultPageSettings.PaperSize = new PaperSize("Receipt", 315, 1200); // 80mm x variable height
            
            printDoc.PrintPage += (sender, e) =>
            {
                if (e.Graphics == null) return;

                var graphics = e.Graphics;
                
                // Fonts - using Arial for better Arabic support
                var regularFont = new Font("Arial", 9, FontStyle.Regular);
                var boldFont = new Font("Arial", 10, FontStyle.Bold);
                var headerFont = new Font("Arial", 12, FontStyle.Bold);
                var totalFont = new Font("Arial", 11, FontStyle.Bold);
                
                float yPos = 20;
                float leftMargin = 20;
                float rightMargin = 295; // 315 - 20
                float centerX = 157.5f; // Center of 315
                float lineHeight = regularFont.GetHeight(graphics);

                // Helper function to draw centered text
                void DrawCentered(string text, Font font, float y)
                {
                    var size = graphics.MeasureString(text, font);
                    graphics.DrawString(text, font, Brushes.Black, centerX - (size.Width / 2), y);
                }

                // Helper function to draw right-aligned text
                void DrawRight(string text, Font font, float y)
                {
                    var size = graphics.MeasureString(text, font);
                    graphics.DrawString(text, font, Brushes.Black, rightMargin - size.Width, y);
                }

                // ============ HEADER ============
                DrawCentered(receipt.BranchName, headerFont, yPos);
                yPos += headerFont.GetHeight(graphics) + 8;

                // Separator line
                graphics.DrawLine(Pens.Black, leftMargin, yPos, rightMargin, yPos);
                yPos += 5;

                // Receipt info
                graphics.DrawString("Receipt #:", regularFont, Brushes.Black, leftMargin, yPos);
                DrawRight(receipt.ReceiptNumber, boldFont, yPos);
                yPos += lineHeight + 3;

                graphics.DrawString("Date:", regularFont, Brushes.Black, leftMargin, yPos);
                DrawRight(receipt.Date.ToString("dd/MM/yyyy HH:mm"), regularFont, yPos);
                yPos += lineHeight + 5;

                // Separator line
                graphics.DrawLine(Pens.Black, leftMargin, yPos, rightMargin, yPos);
                yPos += 8;

                // ============ ITEMS ============
                // Column headers
                graphics.DrawString("Item", boldFont, Brushes.Black, leftMargin, yPos);
                DrawRight("Total", boldFont, yPos);
                yPos += boldFont.GetHeight(graphics) + 3;

                graphics.DrawLine(Pens.Gray, leftMargin, yPos, rightMargin, yPos);
                yPos += 5;

                // Items
                foreach (var item in receipt.Items)
                {
                    // Item name
                    graphics.DrawString(item.Name, regularFont, Brushes.Black, leftMargin, yPos);
                    yPos += lineHeight;

                    // Quantity and price
                    var qtyPrice = $"{item.Quantity} x {item.UnitPrice:F2} EGP";
                    graphics.DrawString(qtyPrice, regularFont, Brushes.Gray, leftMargin + 10, yPos);
                    
                    // Item total (right aligned)
                    DrawRight($"{item.TotalPrice:F2} EGP", regularFont, yPos);
                    yPos += lineHeight + 5;
                }

                // Separator line
                graphics.DrawLine(Pens.Black, leftMargin, yPos, rightMargin, yPos);
                yPos += 8;

                // ============ TOTALS ============
                // Subtotal
                graphics.DrawString("Subtotal:", regularFont, Brushes.Black, leftMargin, yPos);
                DrawRight($"{receipt.NetTotal:F2} EGP", regularFont, yPos);
                yPos += lineHeight + 3;

                // Tax
                graphics.DrawString("Tax (14%):", regularFont, Brushes.Black, leftMargin, yPos);
                DrawRight($"{receipt.TaxAmount:F2} EGP", regularFont, yPos);
                yPos += lineHeight + 5;

                // Total (bold and larger)
                graphics.DrawLine(Pens.Black, leftMargin, yPos, rightMargin, yPos);
                yPos += 5;

                graphics.DrawString("TOTAL:", totalFont, Brushes.Black, leftMargin, yPos);
                DrawRight($"{receipt.TotalAmount:F2} EGP", totalFont, yPos);
                yPos += totalFont.GetHeight(graphics) + 8;

                // Separator line
                graphics.DrawLine(Pens.Black, leftMargin, yPos, rightMargin, yPos);
                yPos += 8;

                // ============ FOOTER ============
                // Payment method
                graphics.DrawString("Payment:", regularFont, Brushes.Black, leftMargin, yPos);
                DrawRight(receipt.PaymentMethod, boldFont, yPos);
                yPos += lineHeight + 3;

                // Cashier
                graphics.DrawString("Cashier:", regularFont, Brushes.Black, leftMargin, yPos);
                DrawRight(receipt.CashierName, regularFont, yPos);
                yPos += lineHeight + 10;

                // Separator line
                graphics.DrawLine(Pens.Gray, leftMargin, yPos, rightMargin, yPos);
                yPos += 8;

                // Barcode representation
                DrawCentered($"*{receipt.ReceiptNumber}*", regularFont, yPos);
                yPos += lineHeight + 5;

                // Thank you message
                DrawCentered("Thank You!", boldFont, yPos);
                yPos += boldFont.GetHeight(graphics) + 5;
                DrawCentered("شكراً لك", boldFont, yPos);
            };

            printDoc.Print();
        });
    }

    /// <summary>
    /// Generates ESC/POS byte sequence for a receipt
    /// </summary>
    private byte[] GenerateReceiptEscPos(ReceiptDto receipt)
    {
        var commands = new List<byte[]>();
        
        // Use Windows-1256 encoding for Arabic support
        var arabicEncoding = Encoding.GetEncoding(1256);

        // Initialize printer
        commands.Add(new byte[] { 0x1B, 0x40 }); // ESC @ - Initialize
        
        // ============ HEADER ============
        // Center align
        commands.Add(new byte[] { 0x1B, 0x61, 0x01 }); // ESC a 1
        
        // Branch name - double size, bold
        commands.Add(new byte[] { 0x1B, 0x21, 0x38 }); // ESC ! 56 (double width + double height + bold)
        commands.Add(arabicEncoding.GetBytes(receipt.BranchName + "\n"));
        commands.Add(new byte[] { 0x1B, 0x21, 0x00 }); // Reset
        commands.Add(arabicEncoding.GetBytes("\n"));
        commands.Add(arabicEncoding.GetBytes("================================\n"));
        commands.Add(arabicEncoding.GetBytes("\n"));

        // Receipt info - left align
        commands.Add(new byte[] { 0x1B, 0x61, 0x00 }); // ESC a 0 (left)
        
        commands.Add(new byte[] { 0x1B, 0x21, 0x08 }); // Bold
        commands.Add(arabicEncoding.GetBytes($"فاتورة رقم: {receipt.ReceiptNumber}\n"));
        commands.Add(new byte[] { 0x1B, 0x21, 0x00 }); // Reset
        
        commands.Add(arabicEncoding.GetBytes($"التاريخ: {receipt.Date:dd/MM/yyyy}\n"));
        commands.Add(arabicEncoding.GetBytes($"الوقت: {receipt.Date:HH:mm}\n"));
        commands.Add(arabicEncoding.GetBytes($"الكاشير: {receipt.CashierName}\n"));
        commands.Add(arabicEncoding.GetBytes("\n"));
        commands.Add(arabicEncoding.GetBytes("================================\n"));
        commands.Add(arabicEncoding.GetBytes("\n"));

        // ============ ITEMS ============
        commands.Add(new byte[] { 0x1B, 0x21, 0x08 }); // Bold
        commands.Add(arabicEncoding.GetBytes("المنتجات:\n"));
        commands.Add(new byte[] { 0x1B, 0x21, 0x00 }); // Reset
        commands.Add(arabicEncoding.GetBytes("--------------------------------\n"));

        foreach (var item in receipt.Items)
        {
            // Item name - bold
            commands.Add(new byte[] { 0x1B, 0x21, 0x08 }); // Bold
            commands.Add(arabicEncoding.GetBytes(TruncateText(item.Name, 32) + "\n"));
            commands.Add(new byte[] { 0x1B, 0x21, 0x00 }); // Reset
            
            // Quantity
            commands.Add(arabicEncoding.GetBytes($"  الكمية: {item.Quantity}\n"));
            
            // Price
            commands.Add(arabicEncoding.GetBytes($"  السعر: {item.UnitPrice:F2} ج.م\n"));
            
            // Total
            commands.Add(new byte[] { 0x1B, 0x21, 0x08 }); // Bold
            commands.Add(arabicEncoding.GetBytes($"  الاجمالي: {item.TotalPrice:F2} ج.م\n"));
            commands.Add(new byte[] { 0x1B, 0x21, 0x00 }); // Reset
            commands.Add(arabicEncoding.GetBytes("\n"));
        }

        commands.Add(arabicEncoding.GetBytes("================================\n"));
        commands.Add(arabicEncoding.GetBytes("\n"));

        // ============ TOTALS ============
        commands.Add(new byte[] { 0x1B, 0x21, 0x08 }); // Bold
        commands.Add(arabicEncoding.GetBytes("الملخص المالي:\n"));
        commands.Add(new byte[] { 0x1B, 0x21, 0x00 }); // Reset
        commands.Add(arabicEncoding.GetBytes("--------------------------------\n"));
        
        // Subtotal
        commands.Add(arabicEncoding.GetBytes(FormatLineArabic("المجموع الفرعي:", $"{receipt.NetTotal:F2} ج.م", 32) + "\n"));
        
        // Tax
        commands.Add(arabicEncoding.GetBytes(FormatLineArabic("الضريبة (14%):", $"{receipt.TaxAmount:F2} ج.م", 32) + "\n"));
        
        commands.Add(arabicEncoding.GetBytes("--------------------------------\n"));
        
        // Total - large and bold
        commands.Add(new byte[] { 0x1B, 0x21, 0x18 }); // Double height + bold
        commands.Add(arabicEncoding.GetBytes(FormatLineArabic("الاجمالي:", $"{receipt.TotalAmount:F2} ج.م", 32) + "\n"));
        commands.Add(new byte[] { 0x1B, 0x21, 0x00 }); // Reset
        
        commands.Add(arabicEncoding.GetBytes("================================\n"));
        commands.Add(arabicEncoding.GetBytes("\n"));

        // ============ PAYMENT ============
        commands.Add(new byte[] { 0x1B, 0x21, 0x08 }); // Bold
        commands.Add(arabicEncoding.GetBytes($"طريقة الدفع: {TranslatePaymentMethod(receipt.PaymentMethod)}\n"));
        commands.Add(new byte[] { 0x1B, 0x21, 0x00 }); // Reset
        commands.Add(arabicEncoding.GetBytes("\n"));
        commands.Add(arabicEncoding.GetBytes("================================\n"));
        commands.Add(arabicEncoding.GetBytes("\n"));

        // ============ FOOTER ============
        // Center align
        commands.Add(new byte[] { 0x1B, 0x61, 0x01 }); // ESC a 1
        
        commands.Add(new byte[] { 0x1B, 0x21, 0x08 }); // Bold
        commands.Add(arabicEncoding.GetBytes("شكراً لزيارتكم\n"));
        commands.Add(arabicEncoding.GetBytes("THANK YOU!\n"));
        commands.Add(new byte[] { 0x1B, 0x21, 0x00 }); // Reset
        commands.Add(arabicEncoding.GetBytes("\n"));
        
        // Barcode
        try
        {
            // Barcode - CODE128
            commands.Add(new byte[] { 0x1D, 0x6B, 0x49 }); // GS k 73 (CODE128)
            var barcodeData = Encoding.ASCII.GetBytes(receipt.ReceiptNumber);
            commands.Add(new byte[] { (byte)barcodeData.Length });
            commands.Add(barcodeData);
            commands.Add(arabicEncoding.GetBytes("\n"));
        }
        catch
        {
            commands.Add(arabicEncoding.GetBytes($"*{receipt.ReceiptNumber}*\n"));
        }

        // Feed and cut
        commands.Add(new byte[] { 0x1B, 0x64, 0x03 }); // ESC d 3 - Feed 3 lines
        commands.Add(new byte[] { 0x1D, 0x56, 0x00 }); // GS V 0 - Full cut

        return commands.SelectMany(x => x).ToArray();
    }

    /// <summary>
    /// Formats a line with Arabic text - right to left
    /// </summary>
    private string FormatLineArabic(string label, string value, int totalWidth)
    {
        var spaces = totalWidth - label.Length - value.Length;
        if (spaces < 1) spaces = 1;
        return label + new string(' ', spaces) + value;
    }

    /// <summary>
    /// Translates payment method to Arabic
    /// </summary>
    private string TranslatePaymentMethod(string method)
    {
        return method.ToLower() switch
        {
            "cash" => "نقدي",
            "card" => "بطاقة",
            "fawry" => "فوري",
            _ => method
        };
    }

    /// <summary>
    /// Truncates text if too long
    /// </summary>
    private string TruncateText(string text, int maxLength)
    {
        if (text.Length <= maxLength)
            return text;
        return text.Substring(0, maxLength - 3) + "...";
    }

    /// <summary>
    /// Sends raw ESC/POS bytes to Windows printer
    /// </summary>
    private Task SendToPrinterAsync(string printerName, byte[] data)
    {
        return Task.Run(() =>
        {
            // Use Windows raw printer API
            var printerHandle = IntPtr.Zero;
            try
            {
                // Open printer
                if (!NativeMethods.OpenPrinter(printerName, out printerHandle, IntPtr.Zero))
                {
                    throw new Exception($"Failed to open printer: {printerName}");
                }

                // Start document
                var docInfo = new NativeMethods.DOC_INFO_1
                {
                    pDocName = "KasserPro Receipt",
                    pOutputFile = null,
                    pDataType = "RAW"
                };

                if (!NativeMethods.StartDocPrinter(printerHandle, 1, ref docInfo))
                {
                    throw new Exception("Failed to start document");
                }

                // Start page
                if (!NativeMethods.StartPagePrinter(printerHandle))
                {
                    throw new Exception("Failed to start page");
                }

                // Write data
                int bytesWritten = 0;
                if (!NativeMethods.WritePrinter(printerHandle, data, data.Length, out bytesWritten))
                {
                    throw new Exception("Failed to write to printer");
                }

                // End page and document
                NativeMethods.EndPagePrinter(printerHandle);
                NativeMethods.EndDocPrinter(printerHandle);
            }
            finally
            {
                if (printerHandle != IntPtr.Zero)
                {
                    NativeMethods.ClosePrinter(printerHandle);
                }
            }
        });
    }
}

/// <summary>
/// Native Windows printing API methods
/// </summary>
internal static class NativeMethods
{
    [System.Runtime.InteropServices.DllImport("winspool.drv", CharSet = System.Runtime.InteropServices.CharSet.Auto, SetLastError = true)]
    public static extern bool OpenPrinter(string pPrinterName, out IntPtr phPrinter, IntPtr pDefault);

    [System.Runtime.InteropServices.DllImport("winspool.drv", SetLastError = true)]
    public static extern bool ClosePrinter(IntPtr hPrinter);

    [System.Runtime.InteropServices.DllImport("winspool.drv", CharSet = System.Runtime.InteropServices.CharSet.Auto, SetLastError = true)]
    public static extern bool StartDocPrinter(IntPtr hPrinter, int level, ref DOC_INFO_1 pDocInfo);

    [System.Runtime.InteropServices.DllImport("winspool.drv", SetLastError = true)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);

    [System.Runtime.InteropServices.DllImport("winspool.drv", SetLastError = true)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);

    [System.Runtime.InteropServices.DllImport("winspool.drv", SetLastError = true)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);

    [System.Runtime.InteropServices.DllImport("winspool.drv", SetLastError = true)]
    public static extern bool WritePrinter(IntPtr hPrinter, byte[] pBytes, int dwCount, out int dwWritten);

    [System.Runtime.InteropServices.StructLayout(System.Runtime.InteropServices.LayoutKind.Sequential, CharSet = System.Runtime.InteropServices.CharSet.Auto)]
    public struct DOC_INFO_1
    {
        public string pDocName;
        public string? pOutputFile;
        public string pDataType;
    }
}
