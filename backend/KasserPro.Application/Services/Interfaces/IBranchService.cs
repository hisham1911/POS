namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Branches;
using KasserPro.Application.DTOs.Common;

public interface IBranchService
{
    Task<ApiResponse<List<BranchDto>>> GetAllAsync();
    Task<ApiResponse<BranchDto>> GetByIdAsync(int id);
    Task<ApiResponse<BranchDto>> CreateAsync(CreateBranchDto dto);
    Task<ApiResponse<BranchDto>> UpdateAsync(int id, UpdateBranchDto dto);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}
