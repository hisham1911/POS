namespace KasserPro.Application.Services.Interfaces;

using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Customers;

/// <summary>
/// Service for customer management operations
/// </summary>
public interface ICustomerService
{
    /// <summary>
    /// Get all customers with pagination
    /// </summary>
    Task<PagedResult<CustomerDto>> GetAllAsync(int page = 1, int pageSize = 20, string? search = null);
    
    /// <summary>
    /// Get customer by ID
    /// </summary>
    Task<CustomerDto?> GetByIdAsync(int id);
    
    /// <summary>
    /// Get customer by phone number
    /// </summary>
    Task<CustomerDto?> GetByPhoneAsync(string phone);
    
    /// <summary>
    /// Create a new customer
    /// </summary>
    Task<CustomerDto> CreateAsync(CreateCustomerRequest request);
    
    /// <summary>
    /// Update an existing customer
    /// </summary>
    Task<CustomerDto?> UpdateAsync(int id, UpdateCustomerRequest request);
    
    /// <summary>
    /// Get or create customer by phone (auto-create if not exists)
    /// </summary>
    /// <param name="phone">Phone number</param>
    /// <param name="name">Optional name for new customer</param>
    /// <returns>Customer info and whether it was newly created</returns>
    Task<(CustomerDto Customer, bool WasCreated)> GetOrCreateByPhoneAsync(string phone, string? name = null);
    
    /// <summary>
    /// Update customer stats after order completion (stats + loyalty points)
    /// </summary>
    /// <param name="customerId">Customer ID</param>
    /// <param name="orderTotal">Order total amount</param>
    /// <param name="loyaltyPoints">Points to add (positive) or deduct (negative)</param>
    Task UpdateOrderStatsAsync(int customerId, decimal orderTotal, int loyaltyPoints = 0);
    
    /// <summary>
    /// Deduct stats when a refund is processed (doesn't affect TotalOrders count)
    /// </summary>
    Task DeductRefundStatsAsync(int customerId, decimal refundAmount, int pointsToDeduct);
    
    /// <summary>
    /// Add loyalty points to customer
    /// </summary>
    Task AddLoyaltyPointsAsync(int customerId, int points);
    
    /// <summary>
    /// Redeem loyalty points from customer
    /// </summary>
    Task<bool> RedeemLoyaltyPointsAsync(int customerId, int points);
    
    /// <summary>
    /// Soft delete a customer
    /// </summary>
    Task<bool> DeleteAsync(int id);
}
