namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Auth;
using KasserPro.Application.DTOs.Common;

public interface IAuthService
{
    Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request);
    Task<ApiResponse<bool>> RegisterAsync(RegisterRequest request);
    Task<ApiResponse<UserInfo>> GetCurrentUserAsync(int userId);
}
