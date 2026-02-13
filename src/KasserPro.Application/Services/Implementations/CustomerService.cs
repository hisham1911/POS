namespace KasserPro.Application.Services.Implementations;

using Microsoft.EntityFrameworkCore;
using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Customers;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Entities;

/// <summary>
/// Service for customer management operations
/// </summary>
public class CustomerService : ICustomerService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CustomerService(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<CustomerDto>> GetAllAsync(int page = 1, int pageSize = 20, string? search = null)
    {
        var tenantId = _currentUser.TenantId;
        
        var query = _unitOfWork.Customers.Query()
            .Where(c => c.TenantId == tenantId && c.IsActive);

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(c => 
                c.Phone.Contains(search) || 
                (c.Name != null && c.Name.ToLower().Contains(searchLower)) ||
                (c.Email != null && c.Email.ToLower().Contains(searchLower)));
        }

        var totalCount = await query.CountAsync();
        
        var customers = await query
            .OrderByDescending(c => c.LastOrderAt ?? c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => MapToDto(c))
            .ToListAsync();

        return new PagedResult<CustomerDto>(customers, totalCount, page, pageSize);
    }

    public async Task<CustomerDto?> GetByIdAsync(int id)
    {
        var tenantId = _currentUser.TenantId;
        
        var customer = await _unitOfWork.Customers.Query()
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId);

        return customer == null ? null : MapToDto(customer);
    }

    public async Task<CustomerDto?> GetByPhoneAsync(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return null;

        var tenantId = _currentUser.TenantId;
        var normalizedPhone = NormalizePhone(phone);
        
        var customer = await _unitOfWork.Customers.Query()
            .FirstOrDefaultAsync(c => c.Phone == normalizedPhone && c.TenantId == tenantId);

        return customer == null ? null : MapToDto(customer);
    }

    public async Task<CustomerDto> CreateAsync(CreateCustomerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Phone))
            throw new ArgumentException("Phone number is required", nameof(request.Phone));

        var tenantId = _currentUser.TenantId;
        var normalizedPhone = NormalizePhone(request.Phone);

        // Check for duplicate phone
        var existingCustomer = await _unitOfWork.Customers.Query()
            .FirstOrDefaultAsync(c => c.Phone == normalizedPhone && c.TenantId == tenantId);

        if (existingCustomer != null)
            throw new InvalidOperationException($"Customer with phone {request.Phone} already exists");

        var customer = new Customer
        {
            TenantId = tenantId,
            Phone = normalizedPhone,
            Name = request.Name,
            Email = request.Email,
            Address = request.Address,
            Notes = request.Notes,
            IsActive = true,
            LoyaltyPoints = 0,
            TotalOrders = 0,
            TotalSpent = 0
        };

        await _unitOfWork.Customers.AddAsync(customer);
        await _unitOfWork.SaveChangesAsync();

        return MapToDto(customer);
    }

    public async Task<CustomerDto?> UpdateAsync(int id, UpdateCustomerRequest request)
    {
        var tenantId = _currentUser.TenantId;
        
        var customer = await _unitOfWork.Customers.Query()
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId);

        if (customer == null)
            return null;

        // Update only provided fields
        if (request.Name != null)
            customer.Name = request.Name;
        if (request.Email != null)
            customer.Email = request.Email;
        if (request.Address != null)
            customer.Address = request.Address;
        if (request.Notes != null)
            customer.Notes = request.Notes;
        if (request.IsActive.HasValue)
            customer.IsActive = request.IsActive.Value;
        if (request.CreditLimit.HasValue)
            customer.CreditLimit = request.CreditLimit.Value;

        await _unitOfWork.SaveChangesAsync();

        return MapToDto(customer);
    }

    public async Task<(CustomerDto Customer, bool WasCreated)> GetOrCreateByPhoneAsync(string phone, string? name = null)
    {
        if (string.IsNullOrWhiteSpace(phone))
            throw new ArgumentException("Phone number is required", nameof(phone));

        var existingCustomer = await GetByPhoneAsync(phone);
        if (existingCustomer != null)
            return (existingCustomer, false);

        // Auto-create customer
        var newCustomer = await CreateAsync(new CreateCustomerRequest
        {
            Phone = phone,
            Name = name
        });

        return (newCustomer, true);
    }

    public async Task UpdateOrderStatsAsync(int customerId, decimal orderTotal, int loyaltyPoints = 0)
    {
        var tenantId = _currentUser.TenantId;
        
        var customer = await _unitOfWork.Customers.Query()
            .FirstOrDefaultAsync(c => c.Id == customerId && c.TenantId == tenantId);

        if (customer == null)
            return;

        // Update order statistics
        customer.TotalOrders++;
        customer.TotalSpent += orderTotal;
        customer.LastOrderAt = DateTime.UtcNow;
        
        // Update loyalty points (can be positive or negative)
        if (loyaltyPoints != 0)
        {
            customer.LoyaltyPoints += loyaltyPoints;
            // Ensure points don't go below zero
            if (customer.LoyaltyPoints < 0)
                customer.LoyaltyPoints = 0;
        }

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task DeductRefundStatsAsync(int customerId, decimal refundAmount, int pointsToDeduct)
    {
        var tenantId = _currentUser.TenantId;
        
        var customer = await _unitOfWork.Customers.Query()
            .FirstOrDefaultAsync(c => c.Id == customerId && c.TenantId == tenantId);

        if (customer == null)
            return;

        // Deduct from TotalSpent (don't go below zero)
        customer.TotalSpent -= refundAmount;
        if (customer.TotalSpent < 0)
            customer.TotalSpent = 0;
        
        // Deduct loyalty points (don't go below zero)
        customer.LoyaltyPoints -= pointsToDeduct;
        if (customer.LoyaltyPoints < 0)
            customer.LoyaltyPoints = 0;

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task UpdateCreditBalanceAsync(int customerId, decimal amountDue)
    {
        var tenantId = _currentUser.TenantId;
        
        var customer = await _unitOfWork.Customers.Query()
            .FirstOrDefaultAsync(c => c.Id == customerId && c.TenantId == tenantId);

        if (customer == null)
            return;

        // Add to TotalDue (customer owes more money)
        customer.TotalDue += amountDue;

        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<bool> ValidateCreditLimitAsync(int customerId, decimal additionalAmount)
    {
        var tenantId = _currentUser.TenantId;
        
        var customer = await _unitOfWork.Customers.Query()
            .FirstOrDefaultAsync(c => c.Id == customerId && c.TenantId == tenantId);

        if (customer == null)
            return false;

        // If credit limit is 0, no limit is enforced
        if (customer.CreditLimit == 0)
            return true;

        // Check if adding this amount would exceed the credit limit
        var newTotalDue = customer.TotalDue + additionalAmount;
        return newTotalDue <= customer.CreditLimit;
    }

    public async Task AddLoyaltyPointsAsync(int customerId, int points)
    {
        if (points <= 0) return;

        var tenantId = _currentUser.TenantId;
        
        var customer = await _unitOfWork.Customers.Query()
            .FirstOrDefaultAsync(c => c.Id == customerId && c.TenantId == tenantId);

        if (customer == null)
            return;

        customer.LoyaltyPoints += points;
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<bool> RedeemLoyaltyPointsAsync(int customerId, int points)
    {
        if (points <= 0) return false;

        var tenantId = _currentUser.TenantId;
        
        var customer = await _unitOfWork.Customers.Query()
            .FirstOrDefaultAsync(c => c.Id == customerId && c.TenantId == tenantId);

        if (customer == null || customer.LoyaltyPoints < points)
            return false;

        customer.LoyaltyPoints -= points;
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var tenantId = _currentUser.TenantId;
        
        var customer = await _unitOfWork.Customers.Query()
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId);

        if (customer == null)
            return false;

        // Soft delete (using both IsActive and IsDeleted for compatibility)
        customer.IsActive = false;
        customer.IsDeleted = true;

        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    #region Private Methods

    private static string NormalizePhone(string phone)
    {
        // Remove spaces, dashes, and other common separators
        return phone.Replace(" ", "")
                   .Replace("-", "")
                   .Replace("(", "")
                   .Replace(")", "")
                   .Trim();
    }

    private static CustomerDto MapToDto(Customer c) => new()
    {
        Id = c.Id,
        Phone = c.Phone,
        Name = c.Name,
        Email = c.Email,
        Address = c.Address,
        Notes = c.Notes,
        LoyaltyPoints = c.LoyaltyPoints,
        TotalOrders = c.TotalOrders,
        TotalSpent = c.TotalSpent,
        LastOrderAt = c.LastOrderAt,
        IsActive = c.IsActive,
        CreatedAt = c.CreatedAt,
        TotalDue = c.TotalDue,
        CreditLimit = c.CreditLimit
    };

    #endregion
}
