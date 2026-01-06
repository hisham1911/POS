namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Shifts;

public interface IShiftService
{
    Task<ApiResponse<ShiftDto>> GetCurrentAsync(int userId);
    Task<ApiResponse<ShiftDto>> OpenAsync(OpenShiftRequest request, int userId);
    Task<ApiResponse<ShiftDto>> CloseAsync(CloseShiftRequest request, int userId);
    Task<ApiResponse<List<ShiftDto>>> GetUserShiftsAsync(int userId);
}
