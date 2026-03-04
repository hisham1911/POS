namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs;
using KasserPro.Application.DTOs.Common;

public interface IUserManagementService
{
    Task<ApiResponse<List<UserDto>>> GetAllUsersAsync();
    Task<ApiResponse<UserDto>> GetUserByIdAsync(int userId);
    Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserRequest request);
    Task<ApiResponse<UserDto>> UpdateUserAsync(int userId, UpdateUserRequest request);
    Task<ApiResponse<bool>> DeleteUserAsync(int userId);
    Task<ApiResponse<bool>> ToggleUserStatusAsync(int userId, bool isActive);
}
