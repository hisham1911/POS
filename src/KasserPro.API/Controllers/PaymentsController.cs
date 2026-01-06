namespace KasserPro.API.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs.Common;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public PaymentsController(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    [HttpGet("order/{orderId}")]
    public async Task<IActionResult> GetByOrder(int orderId)
    {
        var payments = await _unitOfWork.Payments.Query()
            .Where(p => p.OrderId == orderId)
            .Select(p => new
            {
                p.Id,
                Method = p.Method.ToString(),
                p.Amount,
                p.Reference,
                p.CreatedAt
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(payments));
    }
}
