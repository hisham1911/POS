namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.AuditLogs;
using KasserPro.Application.DTOs.Common;

public interface IAuditLogService
{
    Task<ApiResponse<PagedResult<AuditLogDto>>> GetLogsAsync(AuditLogFilterDto filter);
    Task LogAsync(string action, string entityType, int? entityId, string? oldValues = null, string? newValues = null);
}
