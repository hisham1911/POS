namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Reports;

public interface IInventoryReportService
{
    /// <summary>
    /// Get inventory report for a specific branch
    /// </summary>
    Task<ApiResponse<BranchInventoryReportDto>> GetBranchInventoryReportAsync(
        int branchId, 
        int? categoryId = null, 
        bool? lowStockOnly = null);

    /// <summary>
    /// Get unified inventory view across all branches
    /// </summary>
    Task<ApiResponse<List<UnifiedInventoryReportDto>>> GetUnifiedInventoryReportAsync(
        int? categoryId = null, 
        bool? lowStockOnly = null);

    /// <summary>
    /// Get transfer history report
    /// </summary>
    Task<ApiResponse<TransferHistoryReportDto>> GetTransferHistoryReportAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? branchId = null);

    /// <summary>
    /// Get low stock summary report
    /// </summary>
    Task<ApiResponse<LowStockSummaryReportDto>> GetLowStockSummaryReportAsync(
        int? branchId = null);
}
