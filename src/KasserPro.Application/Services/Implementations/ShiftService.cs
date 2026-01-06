namespace KasserPro.Application.Services.Implementations;

using Microsoft.EntityFrameworkCore;
using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Shifts;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Entities;
using KasserPro.Domain.Enums;

public class ShiftService : IShiftService
{
    private readonly IUnitOfWork _unitOfWork;

    public ShiftService(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<ApiResponse<ShiftDto>> GetCurrentAsync(int userId)
    {
        var shift = await _unitOfWork.Shifts.Query()
            .Include(s => s.User)
            .Include(s => s.Orders)
            .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsClosed);

        if (shift == null)
            return ApiResponse<ShiftDto>.Fail("لا توجد وردية مفتوحة");

        return ApiResponse<ShiftDto>.Ok(MapToDto(shift));
    }

    public async Task<ApiResponse<ShiftDto>> OpenAsync(OpenShiftRequest request, int userId)
    {
        var existingShift = await _unitOfWork.Shifts.Query()
            .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsClosed);

        if (existingShift != null)
            return ApiResponse<ShiftDto>.Fail("يوجد وردية مفتوحة بالفعل");

        var shift = new Shift
        {
            UserId = userId,
            OpeningBalance = request.OpeningBalance,
            OpenedAt = DateTime.UtcNow,
            IsClosed = false
        };

        await _unitOfWork.Shifts.AddAsync(shift);
        await _unitOfWork.SaveChangesAsync();

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        shift.User = user!;

        return ApiResponse<ShiftDto>.Ok(MapToDto(shift), "تم فتح الوردية بنجاح");
    }

    public async Task<ApiResponse<ShiftDto>> CloseAsync(CloseShiftRequest request, int userId)
    {
        var shift = await _unitOfWork.Shifts.Query()
            .Include(s => s.User)
            .Include(s => s.Orders).ThenInclude(o => o.Payments)
            .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsClosed);

        if (shift == null)
            return ApiResponse<ShiftDto>.Fail("لا توجد وردية مفتوحة");

        // حساب الإجماليات
        var completedOrders = shift.Orders.Where(o => o.Status == OrderStatus.Completed).ToList();
        
        shift.TotalOrders = completedOrders.Count;
        shift.TotalCash = completedOrders
            .SelectMany(o => o.Payments)
            .Where(p => p.Method == PaymentMethod.Cash)
            .Sum(p => p.Amount);
        shift.TotalCard = completedOrders
            .SelectMany(o => o.Payments)
            .Where(p => p.Method != PaymentMethod.Cash)
            .Sum(p => p.Amount);

        shift.ClosingBalance = request.ClosingBalance;
        shift.ExpectedBalance = shift.OpeningBalance + shift.TotalCash;
        shift.Difference = shift.ClosingBalance - shift.ExpectedBalance;
        shift.ClosedAt = DateTime.UtcNow;
        shift.IsClosed = true;
        shift.Notes = request.Notes;

        _unitOfWork.Shifts.Update(shift);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<ShiftDto>.Ok(MapToDto(shift), "تم إغلاق الوردية بنجاح");
    }

    public async Task<ApiResponse<List<ShiftDto>>> GetUserShiftsAsync(int userId)
    {
        var shifts = await _unitOfWork.Shifts.Query()
            .Include(s => s.User)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.OpenedAt)
            .Take(30)
            .ToListAsync();

        return ApiResponse<List<ShiftDto>>.Ok(shifts.Select(MapToDto).ToList());
    }

    private static ShiftDto MapToDto(Shift shift) => new()
    {
        Id = shift.Id,
        OpeningBalance = shift.OpeningBalance,
        ClosingBalance = shift.ClosingBalance,
        ExpectedBalance = shift.ExpectedBalance,
        Difference = shift.Difference,
        OpenedAt = shift.OpenedAt,
        ClosedAt = shift.ClosedAt,
        IsClosed = shift.IsClosed,
        Notes = shift.Notes,
        TotalCash = shift.TotalCash,
        TotalCard = shift.TotalCard,
        TotalOrders = shift.TotalOrders,
        UserName = shift.User?.Name ?? string.Empty
    };
}
