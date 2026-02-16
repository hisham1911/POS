namespace KasserPro.Application.Services.Implementations;

using Microsoft.EntityFrameworkCore;
using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs.AuditLogs;
using KasserPro.Application.DTOs.Common;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Entities;

public class AuditLogService : IAuditLogService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public AuditLogService(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<PagedResult<AuditLogDto>>> GetLogsAsync(AuditLogFilterDto filter)
    {
        var tenantId = _currentUser.TenantId;
        var query = _unitOfWork.AuditLogs.Query()
            .Include(a => a.User)
            .Where(a => a.TenantId == tenantId);

        // Apply filters
        if (filter.UserId.HasValue)
            query = query.Where(a => a.UserId == filter.UserId);

        if (filter.BranchId.HasValue)
            query = query.Where(a => a.BranchId == filter.BranchId);

        if (!string.IsNullOrEmpty(filter.EntityType))
            query = query.Where(a => a.EntityType == filter.EntityType);

        if (!string.IsNullOrEmpty(filter.Action))
            query = query.Where(a => a.Action.Contains(filter.Action));

        if (filter.FromDate.HasValue)
            query = query.Where(a => a.CreatedAt >= filter.FromDate.Value.Date);

        if (filter.ToDate.HasValue)
            query = query.Where(a => a.CreatedAt < filter.ToDate.Value.Date.AddDays(1));

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                TenantId = a.TenantId,
                BranchId = a.BranchId,
                UserId = a.UserId,
                UserName = a.User != null ? a.User.Name : null,
                Action = a.Action,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                IpAddress = a.IpAddress,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<AuditLogDto>>.Ok(new PagedResult<AuditLogDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        });
    }

    public async Task LogAsync(string action, string entityType, int? entityId, string? oldValues = null, string? newValues = null)
    {
        var log = new AuditLog
        {
            TenantId = _currentUser.TenantId,
            BranchId = _currentUser.BranchId,
            UserId = _currentUser.UserId > 0 ? _currentUser.UserId : null,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            OldValues = oldValues,
            NewValues = newValues,
            IpAddress = null // Can be added via IHttpContextAccessor if needed
        };

        await _unitOfWork.AuditLogs.AddAsync(log);
        await _unitOfWork.SaveChangesAsync();
    }
}
