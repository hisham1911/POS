namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Reports;

public interface IReportService
{
    Task<ApiResponse<DailyReportDto>> GetDailyReportAsync(DateTime? date = null);
    Task<ApiResponse<SalesReportDto>> GetSalesReportAsync(DateTime fromDate, DateTime toDate);
}
