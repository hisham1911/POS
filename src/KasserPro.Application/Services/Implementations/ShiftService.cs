namespace KasserPro.Application.Services.Implementations;

using Microsoft.EntityFrameworkCore;
using KasserPro.Application.Common;
using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Shifts;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Entities;
using KasserPro.Domain.Enums;

public class ShiftService : IShiftService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;
    private readonly ICashRegisterService _cashRegisterService;

    public ShiftService(IUnitOfWork unitOfWork, ICurrentUserService currentUser, ICashRegisterService cashRegisterService)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _cashRegisterService = cashRegisterService;
    }

    public async Task<ApiResponse<ShiftDto>> GetCurrentAsync(int userId)
    {
        // Validate userId
        if (userId <= 0)
            return ApiResponse<ShiftDto>.Fail(ErrorCodes.USER_NOT_FOUND, "معرف المستخدم غير صالح");

        var tenantId = _currentUser.TenantId;
        var branchId = _currentUser.BranchId;

        // SECURITY: Validate tenant context
        if (tenantId <= 0)
            return ApiResponse<ShiftDto>.Fail(ErrorCodes.TENANT_NOT_FOUND, "سياق المستأجر غير صالح");

        // Query shift for this user in the current branch with Orders and Payments eager loaded
        var shift = await _unitOfWork.Shifts.Query()
            .Include(s => s.User)
            .Include(s => s.Orders.OrderByDescending(o => o.CreatedAt))
                .ThenInclude(o => o.Payments)
            .FirstOrDefaultAsync(s => s.UserId == userId 
                                   && s.TenantId == tenantId 
                                   && s.BranchId == branchId 
                                   && !s.IsClosed);

        if (shift == null)
            return ApiResponse<ShiftDto>.Fail("لا توجد وردية مفتوحة");

        return ApiResponse<ShiftDto>.Ok(MapToDto(shift));
    }

    public async Task<ApiResponse<ShiftDto>> OpenAsync(OpenShiftRequest request, int userId)
    {
        // Validate userId
        if (userId <= 0)
            return ApiResponse<ShiftDto>.Fail(ErrorCodes.USER_NOT_FOUND, "معرف المستخدم غير صالح");

        var tenantId = _currentUser.TenantId;
        var branchId = _currentUser.BranchId;

        // SECURITY: Validate TenantId and BranchId
        if (tenantId <= 0)
            return ApiResponse<ShiftDto>.Fail(ErrorCodes.TENANT_NOT_FOUND, "معرف المستأجر غير صالح");
        
        if (branchId <= 0)
            return ApiResponse<ShiftDto>.Fail(ErrorCodes.BRANCH_NOT_FOUND, "معرف الفرع غير صالح");

        // Verify user exists
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
            return ApiResponse<ShiftDto>.Fail(ErrorCodes.USER_NOT_FOUND, ErrorMessages.Get(ErrorCodes.USER_NOT_FOUND));

        // Verify branch exists
        var branch = await _unitOfWork.Branches.GetByIdAsync(branchId);
        if (branch == null)
            return ApiResponse<ShiftDto>.Fail(ErrorCodes.BRANCH_NOT_FOUND, ErrorMessages.Get(ErrorCodes.BRANCH_NOT_FOUND));

        // Check for existing open shift for this user in this branch
        var existingShift = await _unitOfWork.Shifts.Query()
            .FirstOrDefaultAsync(s => s.UserId == userId 
                                   && s.TenantId == tenantId 
                                   && s.BranchId == branchId 
                                   && !s.IsClosed);

        if (existingShift != null)
            return ApiResponse<ShiftDto>.Fail(ErrorCodes.SHIFT_ALREADY_OPEN, "يوجد وردية مفتوحة بالفعل في هذا الفرع");

        // Use transaction for atomicity - Shift + Cash Register Opening
        await using var transaction = await _unitOfWork.BeginTransactionAsync();
        
        try
        {
            var shift = new Shift
            {
                TenantId = tenantId,
                BranchId = branchId,
                UserId = userId,
                OpeningBalance = Math.Round(request.OpeningBalance, 2),
                OpenedAt = DateTime.UtcNow,
                IsClosed = false
            };

            await _unitOfWork.Shifts.AddAsync(shift);
            await _unitOfWork.SaveChangesAsync();

            // INTEGRATION: Create Opening cash register transaction
            await _cashRegisterService.RecordTransactionAsync(
                type: CashRegisterTransactionType.Opening,
                amount: shift.OpeningBalance,
                description: $"فتح وردية - {user.Name}",
                referenceType: "Shift",
                referenceId: shift.Id,
                shiftId: shift.Id
            );

            await transaction.CommitAsync();

            shift.User = user;

            return ApiResponse<ShiftDto>.Ok(MapToDto(shift), "تم فتح الوردية بنجاح");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return ApiResponse<ShiftDto>.Fail(ErrorCodes.SYSTEM_INTERNAL_ERROR, 
                $"حدث خطأ أثناء فتح الوردية: {ex.Message}");
        }
    }

    /// <summary>
    /// Close a shift with optimistic concurrency control.
    /// Uses RowVersion to prevent race conditions when multiple requests try to close the same shift.
    /// 
    /// Scenario: If two admins click "Close Shift" at the exact same millisecond:
    /// - First request: Loads shift with RowVersion = 0x00000001
    /// - Second request: Loads shift with RowVersion = 0x00000001
    /// - First request: Saves successfully, RowVersion becomes 0x00000002
    /// - Second request: Fails with DbUpdateConcurrencyException (RowVersion mismatch)
    /// </summary>
    public async Task<ApiResponse<ShiftDto>> CloseAsync(CloseShiftRequest request, int userId)
    {
        // Validate userId
        if (userId <= 0)
            return ApiResponse<ShiftDto>.Fail(ErrorCodes.USER_NOT_FOUND, "معرف المستخدم غير صالح");

        var tenantId = _currentUser.TenantId;
        var branchId = _currentUser.BranchId;

        // SECURITY: Validate tenant context
        if (tenantId <= 0)
            return ApiResponse<ShiftDto>.Fail(ErrorCodes.TENANT_NOT_FOUND, "سياق المستأجر غير صالح");

        // Use transaction for atomicity
        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        try
        {
            var shift = await _unitOfWork.Shifts.Query()
                .Include(s => s.User)
                .Include(s => s.Orders).ThenInclude(o => o.Payments)
                .FirstOrDefaultAsync(s => s.UserId == userId 
                                       && s.TenantId == tenantId 
                                       && s.BranchId == branchId 
                                       && !s.IsClosed);

            if (shift == null)
                return ApiResponse<ShiftDto>.Fail(ErrorCodes.SHIFT_NOT_FOUND, "لا توجد وردية مفتوحة");

            // Double-check: Ensure shift is still open (race condition protection)
            if (shift.IsClosed)
                return ApiResponse<ShiftDto>.Fail(ErrorCodes.SHIFT_ALREADY_CLOSED, "الوردية مغلقة بالفعل");

            // INTEGRATION: Validate reconciliation before closing
            // Get current cash balance from cash register
            var balanceResponse = await _cashRegisterService.GetCurrentBalanceAsync(branchId);
            if (!balanceResponse.Success)
                return ApiResponse<ShiftDto>.Fail(ErrorCodes.SYSTEM_INTERNAL_ERROR, 
                    "فشل الحصول على رصيد الخزينة");

            var currentCashBalance = balanceResponse.Data!.CurrentBalance;

            // Calculate totals from completed orders
            var completedOrders = shift.Orders.Where(o => o.Status == OrderStatus.Completed).ToList();
            
            shift.TotalOrders = completedOrders.Count;
            shift.TotalCash = Math.Round(completedOrders
                .SelectMany(o => o.Payments)
                .Where(p => p.Method == PaymentMethod.Cash)
                .Sum(p => p.Amount), 2);
            shift.TotalCard = Math.Round(completedOrders
                .SelectMany(o => o.Payments)
                .Where(p => p.Method != PaymentMethod.Cash)
                .Sum(p => p.Amount), 2);

            shift.ClosingBalance = Math.Round(request.ClosingBalance, 2);
            shift.ExpectedBalance = Math.Round(currentCashBalance, 2); // Use cash register balance
            shift.Difference = Math.Round(shift.ClosingBalance - shift.ExpectedBalance, 2);
            shift.ClosedAt = DateTime.UtcNow;
            shift.IsClosed = true;
            shift.Notes = request.Notes;

            _unitOfWork.Shifts.Update(shift);
            
            // This will throw DbUpdateConcurrencyException if RowVersion doesn't match
            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            return ApiResponse<ShiftDto>.Ok(MapToDto(shift), "تم إغلاق الوردية بنجاح");
        }
        catch (DbUpdateConcurrencyException)
        {
            // Another request already closed this shift
            await transaction.RollbackAsync();
            return ApiResponse<ShiftDto>.Fail(ErrorCodes.SHIFT_CONCURRENCY_CONFLICT, 
                "تم إغلاق الوردية بواسطة مستخدم آخر. يرجى تحديث الصفحة.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return ApiResponse<ShiftDto>.Fail(ErrorCodes.SYSTEM_INTERNAL_ERROR, 
                $"حدث خطأ أثناء إغلاق الوردية: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<ShiftDto>>> GetUserShiftsAsync(int userId)
    {
        // Validate userId
        if (userId <= 0)
            return ApiResponse<List<ShiftDto>>.Fail(ErrorCodes.USER_NOT_FOUND, "معرف المستخدم غير صالح");

        var tenantId = _currentUser.TenantId;
        var branchId = _currentUser.BranchId;

        // SECURITY: Validate tenant context
        if (tenantId <= 0)
            return ApiResponse<List<ShiftDto>>.Fail(ErrorCodes.TENANT_NOT_FOUND, "سياق المستأجر غير صالح");

        var shifts = await _unitOfWork.Shifts.Query()
            .Include(s => s.User)
            .Where(s => s.UserId == userId && s.TenantId == tenantId && s.BranchId == branchId)
            .OrderByDescending(s => s.OpenedAt)
            .Take(30)
            .ToListAsync();

        return ApiResponse<List<ShiftDto>>.Ok(shifts.Select(MapToDto).ToList());
    }

    /// <summary>
    /// Shift deletion is NOT supported for audit/financial integrity.
    /// Shifts contain financial records that must be preserved for accounting and legal compliance.
    /// </summary>
    /// <exception cref="NotSupportedException">Always thrown - shifts cannot be deleted.</exception>
    public Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        throw new NotSupportedException("حذف الورديات غير مسموح به للحفاظ على سلامة السجلات المالية");
    }

    private static ShiftDto MapToDto(Shift shift)
    {
        // Calculate totals dynamically from loaded orders (for open shifts)
        var completedOrders = shift.Orders?.Where(o => o.Status == OrderStatus.Completed).ToList() ?? new();
        
        // Calculate payment totals from completed orders
        var allPayments = completedOrders.SelectMany(o => o.Payments ?? Enumerable.Empty<Payment>()).ToList();
        var calculatedTotalCash = Math.Round(allPayments.Where(p => p.Method == PaymentMethod.Cash).Sum(p => p.Amount), 2);
        var calculatedTotalCard = Math.Round(allPayments.Where(p => p.Method == PaymentMethod.Card).Sum(p => p.Amount), 2);
        var calculatedTotalOrders = completedOrders.Count;

        // Use calculated values for open shifts, stored values for closed shifts
        var totalCash = shift.IsClosed ? shift.TotalCash : calculatedTotalCash;
        var totalCard = shift.IsClosed ? shift.TotalCard : calculatedTotalCard;
        var totalOrders = shift.IsClosed ? shift.TotalOrders : calculatedTotalOrders;

        return new ShiftDto
        {
            Id = shift.Id,
            OpeningBalance = shift.OpeningBalance,
            ClosingBalance = shift.ClosingBalance,
            ExpectedBalance = shift.IsClosed ? shift.ExpectedBalance : Math.Round(shift.OpeningBalance + calculatedTotalCash, 2),
            Difference = shift.Difference,
            OpenedAt = shift.OpenedAt,
            ClosedAt = shift.ClosedAt,
            IsClosed = shift.IsClosed,
            Notes = shift.Notes,
            TotalCash = totalCash,
            TotalCard = totalCard,
            TotalOrders = totalOrders,
            UserName = shift.User?.Name ?? string.Empty,
            Orders = shift.Orders?.Select(o => new ShiftOrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                Status = o.Status.ToString(),
                OrderType = o.OrderType.ToString(),
                Total = o.Total,
                CustomerName = o.CustomerName,
                CreatedAt = o.CreatedAt,
                CompletedAt = o.CompletedAt
            }).ToList() ?? new()
        };
    }
}
