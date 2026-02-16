using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using KasserPro.API.Hubs;
using KasserPro.Application.DTOs.Orders;

namespace KasserPro.API.Controllers;

/// <summary>
/// Test controller for sending print commands to Desktop Bridge App
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class DeviceTestController : ControllerBase
{
    private readonly IHubContext<DeviceHub> _hubContext;
    private readonly ILogger<DeviceTestController> _logger;

    public DeviceTestController(
        IHubContext<DeviceHub> hubContext,
        ILogger<DeviceTestController> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    /// <summary>
    /// Send a test print command to all connected devices
    /// </summary>
    /// <returns>Success message</returns>
    [HttpPost("test-print")]
    public async Task<IActionResult> SendTestPrint()
    {
        try
        {
            var command = new PrintCommandDto
            {
                CommandId = Guid.NewGuid().ToString(),
                Receipt = new ReceiptDto
                {
                    ReceiptNumber = $"TEST-{DateTime.Now:yyyyMMddHHmmss}",
                    BranchName = "فرع الاختبار - Test Branch",
                    Date = DateTime.Now,
                    Items = new List<ReceiptItemDto>
                    {
                        new ReceiptItemDto
                        {
                            Name = "منتج تجريبي 1 - Test Product 1",
                            Quantity = 2,
                            UnitPrice = 50.00m,
                            TotalPrice = 100.00m
                        },
                        new ReceiptItemDto
                        {
                            Name = "منتج تجريبي 2 - Test Product 2",
                            Quantity = 1,
                            UnitPrice = 75.50m,
                            TotalPrice = 75.50m
                        }
                    },
                    NetTotal = 175.50m,
                    TaxAmount = 24.57m,
                    TotalAmount = 200.07m,
                    PaymentMethod = "نقدي - Cash",
                    CashierName = "كاشير تجريبي - Test Cashier"
                }
            };

            _logger.LogInformation("Sending test print command {CommandId} to devices", command.CommandId);

            // P0-5: Send test print to a specific branch group (or all if no branch specified)
            var branchId = Request.Headers["X-Branch-Id"].FirstOrDefault();
            if (!string.IsNullOrEmpty(branchId))
            {
                await _hubContext.Clients.Group($"branch-{branchId}")
                    .SendAsync("PrintReceipt", command);
            }
            else
            {
                // Fallback for test: send to default group
                await _hubContext.Clients.Group("branch-default")
                    .SendAsync("PrintReceipt", command);
            }

            _logger.LogInformation("Test print command sent successfully to branch {BranchId}", branchId ?? "default");

            return Ok(new
            {
                success = true,
                message = "Test print command sent to all connected devices",
                commandId = command.CommandId,
                connectedDevices = DeviceHub.GetConnectedDeviceCount()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send test print command");
            return StatusCode(500, new
            {
                success = false,
                message = "Failed to send test print command",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Get status of connected devices
    /// </summary>
    /// <returns>Device status</returns>
    [HttpGet("status")]
    public IActionResult GetDeviceStatus()
    {
        var connectedDevices = DeviceHub.GetConnectedDeviceCount();

        return Ok(new
        {
            connectedDevices,
            hubEndpoint = "/hubs/devices",
            status = connectedDevices > 0 ? "Online" : "No devices connected"
        });
    }
}
