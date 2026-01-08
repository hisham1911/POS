namespace KasserPro.Application.Services.Implementations;

using Microsoft.EntityFrameworkCore;
using KasserPro.Application.Common;
using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Orders;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Entities;
using KasserPro.Domain.Enums;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    // Valid state transitions
    private static readonly Dictionary<OrderStatus, OrderStatus[]> ValidTransitions = new()
    {
        { OrderStatus.Draft, new[] { OrderStatus.Pending, OrderStatus.Completed, OrderStatus.Cancelled } },
        { OrderStatus.Pending, new[] { OrderStatus.Completed, OrderStatus.Cancelled } },
        { OrderStatus.Completed, Array.Empty<OrderStatus>() },
        { OrderStatus.Cancelled, Array.Empty<OrderStatus>() }
    };

    public OrderService(IUnitOfWork unitOfWork, ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<OrderDto>> CreateAsync(CreateOrderRequest request, int userId)
    {
        var tenantId = _currentUser.TenantId;
        var branchId = _currentUser.BranchId;

        // VALIDATION: Order must have at least one item
        if (request.Items == null || request.Items.Count == 0)
            return ApiResponse<OrderDto>.Fail(ErrorCodes.ORDER_EMPTY, "لا يمكن إنشاء طلب فارغ");

        // Get Tenant for dynamic tax settings
        var tenant = await _unitOfWork.Tenants.GetByIdAsync(tenantId);
        if (tenant == null)
            return ApiResponse<OrderDto>.Fail(ErrorCodes.TENANT_NOT_FOUND, "الشركة غير موجودة");

        // Get Branch for snapshot and default tax rate
        var branch = await _unitOfWork.Branches.GetByIdAsync(branchId);
        if (branch == null)
            return ApiResponse<OrderDto>.Fail(ErrorCodes.BRANCH_NOT_FOUND, ErrorMessages.Get(ErrorCodes.BRANCH_NOT_FOUND));

        // Get User for snapshot
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
            return ApiResponse<OrderDto>.Fail(ErrorCodes.USER_NOT_FOUND, ErrorMessages.Get(ErrorCodes.USER_NOT_FOUND));

        // SHIFT VALIDATION: Check for open shift in this branch for this user
        // Strict validation: Shift must belong to the same TenantId, BranchId, and UserId
        var currentShift = await _unitOfWork.Shifts.Query()
            .FirstOrDefaultAsync(s => s.TenantId == tenantId 
                                   && s.BranchId == branchId 
                                   && s.UserId == userId
                                   && !s.IsClosed);
        
        if (currentShift == null)
            return ApiResponse<OrderDto>.Fail(ErrorCodes.NO_OPEN_SHIFT, "يجب فتح وردية قبل إنشاء طلب");

        // Additional validation: Ensure shift's branch matches current user's branch
        if (currentShift.BranchId != branchId)
            return ApiResponse<OrderDto>.Fail(ErrorCodes.SHIFT_BRANCH_MISMATCH, "الوردية المفتوحة لا تنتمي للفرع الحالي");

        // Dynamic Tax Rate from Tenant Settings
        var tenantTaxRate = tenant.IsTaxEnabled ? tenant.TaxRate : 0m;

        var order = new Order
        {
            TenantId = tenantId,
            BranchId = branchId,
            // SHIFT LINKING: Link order to current shift
            ShiftId = currentShift.Id,
            OrderNumber = GenerateOrderNumber(),
            UserId = userId,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            Notes = request.Notes,
            Status = OrderStatus.Draft,
            OrderType = request.OrderType,
            // Branch Snapshot (on Order entity)
            BranchName = branch.Name,
            BranchAddress = branch.Address,
            BranchPhone = branch.Phone,
            // User Snapshot (on Order entity)
            UserName = user.Name,
            // Currency from Branch
            CurrencyCode = branch.CurrencyCode,
            // Tax Rate from Tenant (dynamic)
            TaxRate = tenantTaxRate
        };

        foreach (var item in request.Items)
        {
            // VALIDATION: Quantity must be positive
            if (item.Quantity <= 0)
                return ApiResponse<OrderDto>.Fail("الكمية يجب أن تكون أكبر من صفر");

            var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId);
            
            // VALIDATION: Product must exist AND be active
            if (product == null)
                return ApiResponse<OrderDto>.Fail(ErrorCodes.PRODUCT_NOT_FOUND, $"المنتج غير موجود: {item.ProductId}");
            
            if (!product.IsActive)
                return ApiResponse<OrderDto>.Fail(ErrorCodes.PRODUCT_INACTIVE, $"المنتج غير متاح للبيع: {product.Name}");

            // Dynamic Tax Rate Priority: Product → Tenant
            // If product has specific tax rate, use it; otherwise use tenant's rate
            var taxRate = product.TaxRate ?? tenantTaxRate;
            
            // If tax is disabled at tenant level, override to 0
            if (!tenant.IsTaxEnabled)
                taxRate = 0m;

            var orderItem = new OrderItem
            {
                ProductId = product.Id,
                // Product Snapshot (on OrderItem entity)
                ProductName = product.Name,
                ProductNameEn = product.NameEn,
                ProductSku = product.Sku,
                ProductBarcode = product.Barcode,
                // Price Snapshot - UnitPrice is NET (excluding tax)
                UnitPrice = product.Price,
                UnitCost = product.Cost,
                OriginalPrice = product.Price,
                Quantity = item.Quantity,
                // Tax Snapshot - Dynamic from Product or Tenant
                TaxRate = taxRate,
                TaxInclusive = false, // Always Tax Exclusive (Additive)
                Notes = item.Notes
            };
            
            // Calculate tax amount and totals with proper rounding
            CalculateItemTotals(orderItem);
            order.Items.Add(orderItem);
        }

        CalculateOrderTotals(order);

        await _unitOfWork.Orders.AddAsync(order);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<OrderDto>.Ok(MapToDto(order), "تم إنشاء الطلب بنجاح");
    }

    public async Task<ApiResponse<OrderDto>> GetByIdAsync(int id)
    {
        var order = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id && o.TenantId == _currentUser.TenantId);

        if (order == null)
            return ApiResponse<OrderDto>.Fail(ErrorCodes.ORDER_NOT_FOUND, ErrorMessages.Get(ErrorCodes.ORDER_NOT_FOUND));

        return ApiResponse<OrderDto>.Ok(MapToDto(order));
    }

    public async Task<ApiResponse<List<OrderDto>>> GetTodayOrdersAsync()
    {
        var today = DateTime.UtcNow.Date;
        var tenantId = _currentUser.TenantId;
        var branchId = _currentUser.BranchId;
        
        var orders = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .Include(o => o.Payments)
            .Where(o => o.TenantId == tenantId && o.BranchId == branchId && o.CreatedAt.Date == today)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return ApiResponse<List<OrderDto>>.Ok(orders.Select(MapToDto).ToList());
    }

    public async Task<ApiResponse<OrderDto>> AddItemAsync(int orderId, AddOrderItemRequest request)
    {
        // VALIDATION: Quantity must be positive
        if (request.Quantity <= 0)
            return ApiResponse<OrderDto>.Fail("الكمية يجب أن تكون أكبر من صفر");

        var order = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            return ApiResponse<OrderDto>.Fail(ErrorCodes.ORDER_NOT_FOUND, ErrorMessages.Get(ErrorCodes.ORDER_NOT_FOUND));

        if (order.Status != OrderStatus.Draft)
            return ApiResponse<OrderDto>.Fail(ErrorCodes.ORDER_CANNOT_MODIFY, ErrorMessages.Get(ErrorCodes.ORDER_CANNOT_MODIFY));

        var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId);
        if (product == null)
            return ApiResponse<OrderDto>.Fail(ErrorCodes.PRODUCT_NOT_FOUND, ErrorMessages.Get(ErrorCodes.PRODUCT_NOT_FOUND));
        
        // VALIDATION: Product must be active
        if (!product.IsActive)
            return ApiResponse<OrderDto>.Fail(ErrorCodes.PRODUCT_INACTIVE, $"المنتج غير متاح للبيع: {product.Name}");

        // Get Tenant for dynamic tax settings
        var tenant = await _unitOfWork.Tenants.GetByIdAsync(order.TenantId);
        var tenantTaxRate = tenant?.IsTaxEnabled == true ? tenant.TaxRate : 0m;

        // Dynamic Tax Rate Priority: Product → Tenant
        var taxRate = product.TaxRate ?? tenantTaxRate;
        
        // If tax is disabled at tenant level, override to 0
        if (tenant?.IsTaxEnabled != true)
            taxRate = 0m;

        var orderItem = new OrderItem
        {
            ProductId = product.Id,
            // Product Snapshot (on OrderItem entity)
            ProductName = product.Name,
            ProductNameEn = product.NameEn,
            ProductSku = product.Sku,
            ProductBarcode = product.Barcode,
            // Price Snapshot
            UnitPrice = product.Price,
            UnitCost = product.Cost,
            OriginalPrice = product.Price,
            Quantity = request.Quantity,
            // Tax Snapshot - Dynamic from Product or Tenant
            TaxRate = taxRate,
            TaxInclusive = false, // Always Tax Exclusive (Additive)
            Notes = request.Notes
        };
        
        // Calculate tax amount and totals with proper rounding
        CalculateItemTotals(orderItem);

        order.Items.Add(orderItem);
        CalculateOrderTotals(order);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<OrderDto>.Ok(MapToDto(order));
    }

    public async Task<ApiResponse<OrderDto>> RemoveItemAsync(int orderId, int itemId)
    {
        var order = await _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            return ApiResponse<OrderDto>.Fail(ErrorCodes.ORDER_NOT_FOUND, ErrorMessages.Get(ErrorCodes.ORDER_NOT_FOUND));

        // VALIDATION: Can only modify Draft orders
        if (order.Status != OrderStatus.Draft)
            return ApiResponse<OrderDto>.Fail(ErrorCodes.ORDER_CANNOT_MODIFY, "لا يمكن تعديل طلب مكتمل أو ملغي");

        var item = order.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            return ApiResponse<OrderDto>.Fail(ErrorCodes.ORDER_ITEM_NOT_FOUND, "عنصر الطلب غير موجود");

        order.Items.Remove(item);
        CalculateOrderTotals(order);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<OrderDto>.Ok(MapToDto(order));
    }

    /// <summary>
    /// Complete an order with payments - uses database transaction for atomicity.
    /// If saving order succeeds but adding payment fails, the entire operation is rolled back.
    /// </summary>
    public async Task<ApiResponse<OrderDto>> CompleteAsync(int orderId, CompleteOrderRequest request)
    {
        // Use transaction for atomicity - Order + Payments must succeed together
        await using var transaction = await _unitOfWork.BeginTransactionAsync();
        
        try
        {
            var order = await _unitOfWork.Orders.Query()
                .Include(o => o.Items)
                .Include(o => o.Payments)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.TenantId == _currentUser.TenantId);

            if (order == null)
                return ApiResponse<OrderDto>.Fail(ErrorCodes.ORDER_NOT_FOUND, ErrorMessages.Get(ErrorCodes.ORDER_NOT_FOUND));

            // Validate state transition
            var validationResult = ValidateStateTransition(order.Status, OrderStatus.Completed);
            if (!validationResult.Success)
                return ApiResponse<OrderDto>.Fail(ErrorCodes.ORDER_INVALID_STATE_TRANSITION, validationResult.Message!);

            // Validate payment amount
            decimal totalPaymentAmount = request.Payments.Sum(p => p.Amount);
            if (totalPaymentAmount < order.Total)
                return ApiResponse<OrderDto>.Fail(ErrorCodes.PAYMENT_INSUFFICIENT, 
                    $"المبلغ المدفوع ({totalPaymentAmount:F2}) أقل من إجمالي الطلب ({order.Total:F2})");

            // VALIDATION: Overpayment limit (max 2x Total to prevent money laundering/errors)
            decimal maxAllowedPayment = order.Total * 2;
            if (totalPaymentAmount > maxAllowedPayment)
                return ApiResponse<OrderDto>.Fail(ErrorCodes.PAYMENT_OVERPAYMENT_LIMIT, 
                    $"المبلغ المدفوع ({totalPaymentAmount:F2}) يتجاوز الحد المسموح ({maxAllowedPayment:F2})");

            // Add payments
            decimal totalPaid = 0;
            foreach (var paymentReq in request.Payments)
            {
                if (paymentReq.Amount <= 0)
                    continue;
                    
                var payment = new Payment
                {
                    TenantId = _currentUser.TenantId,
                    BranchId = _currentUser.BranchId,
                    OrderId = order.Id,
                    Amount = Math.Round(paymentReq.Amount, 2),
                    Method = Enum.Parse<PaymentMethod>(paymentReq.Method),
                    Reference = paymentReq.Reference
                };
                await _unitOfWork.Payments.AddAsync(payment);
                order.Payments.Add(payment);
                totalPaid += payment.Amount;
            }

            // Update order status and payment info
            order.Status = OrderStatus.Completed;
            order.AmountPaid = Math.Round(totalPaid, 2);
            order.AmountDue = Math.Round(order.Total - totalPaid, 2);
            order.ChangeAmount = totalPaid > order.Total ? Math.Round(totalPaid - order.Total, 2) : 0;
            order.CompletedAt = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync();
            
            // Commit transaction - all operations succeeded
            await transaction.CommitAsync();

            return ApiResponse<OrderDto>.Ok(MapToDto(order), "تم إتمام الدفع وإغلاق الطلب");
        }
        catch (Exception ex)
        {
            // Rollback transaction - something failed
            await transaction.RollbackAsync();
            return ApiResponse<OrderDto>.Fail(ErrorCodes.SYSTEM_INTERNAL_ERROR, 
                $"حدث خطأ أثناء إتمام الطلب: {ex.Message}");
        }
    }

    public async Task<ApiResponse<bool>> CancelAsync(int orderId, string? reason)
    {
        var order = await _unitOfWork.Orders.GetByIdAsync(orderId);
        if (order == null)
            return ApiResponse<bool>.Fail(ErrorCodes.ORDER_NOT_FOUND, ErrorMessages.Get(ErrorCodes.ORDER_NOT_FOUND));

        // Validate state transition
        var validationResult = ValidateStateTransition(order.Status, OrderStatus.Cancelled);
        if (!validationResult.Success)
            return ApiResponse<bool>.Fail(ErrorCodes.ORDER_INVALID_STATE_TRANSITION, validationResult.Message!);

        order.Status = OrderStatus.Cancelled;
        order.CancelledAt = DateTime.UtcNow;
        order.CancellationReason = reason;

        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.Ok(true, "تم إلغاء الطلب");
    }

    private static ApiResponse<bool> ValidateStateTransition(OrderStatus currentStatus, OrderStatus newStatus)
    {
        if (!ValidTransitions.TryGetValue(currentStatus, out var validNextStates))
            return ApiResponse<bool>.Fail($"حالة الطلب غير معروفة: {currentStatus}");

        if (!validNextStates.Contains(newStatus))
            return ApiResponse<bool>.Fail($"لا يمكن تغيير حالة الطلب من {currentStatus} إلى {newStatus}");

        return ApiResponse<bool>.Ok(true);
    }

    /// <summary>
    /// Calculate item totals including tax amount with proper rounding.
    /// Tax Exclusive (Additive): Price is NET (excluding tax), tax is added on top.
    /// 
    /// Formulas:
    ///   NetTotal = UnitPrice * Quantity
    ///   TaxAmount = NetTotal * (TaxRate / 100)
    ///   Total = NetTotal + TaxAmount
    /// 
    /// Example (100 EGP Net with 14% VAT):
    ///   NetTotal = 100 EGP
    ///   TaxAmount = 100 * 0.14 = 14 EGP
    ///   Total = 100 + 14 = 114 EGP
    /// </summary>
    private static void CalculateItemTotals(OrderItem item)
    {
        // Subtotal = Net price * Quantity (before tax, before discount)
        item.Subtotal = Math.Round(item.UnitPrice * item.Quantity, 2);
        
        // Apply discount if any
        if (item.DiscountType == "percentage" && item.DiscountValue.HasValue)
            item.DiscountAmount = Math.Round(item.Subtotal * (item.DiscountValue.Value / 100m), 2);
        else if (item.DiscountType == "fixed" && item.DiscountValue.HasValue)
            item.DiscountAmount = Math.Round(item.DiscountValue.Value, 2);
        else
            item.DiscountAmount = 0;
        
        // Net amount after discount
        var netAfterDiscount = Math.Round(item.Subtotal - item.DiscountAmount, 2);
        
        // Tax Exclusive (Additive): Calculate tax and add on top
        // TaxAmount = NetAmount * (TaxRate / 100)
        item.TaxAmount = Math.Round(netAfterDiscount * (item.TaxRate / 100m), 2);
        
        // Total = Net + Tax
        item.Total = Math.Round(netAfterDiscount + item.TaxAmount, 2);
    }

    private static void CalculateOrderTotals(Order order)
    {
        // Subtotal = Sum of all item subtotals (Net amounts before tax)
        order.Subtotal = Math.Round(order.Items.Sum(i => i.Subtotal - i.DiscountAmount), 2);
        
        // Tax = Sum of all item tax amounts
        order.TaxAmount = Math.Round(order.Items.Sum(i => i.TaxAmount), 2);
        
        // Apply order-level discount (on subtotal)
        if (order.DiscountType == "percentage" && order.DiscountValue.HasValue)
            order.DiscountAmount = Math.Round(order.Subtotal * (order.DiscountValue.Value / 100m), 2);
        else if (order.DiscountType == "fixed" && order.DiscountValue.HasValue)
            order.DiscountAmount = Math.Round(order.DiscountValue.Value, 2);
        else
            order.DiscountAmount = 0;
        
        // Calculate service charge (on subtotal)
        order.ServiceChargeAmount = Math.Round(order.Subtotal * (order.ServiceChargePercent / 100m), 2);
        
        // Total = Sum of item totals - order discount + service charge
        // Item totals already include their tax amounts
        var itemsTotal = Math.Round(order.Items.Sum(i => i.Total), 2);
        order.Total = Math.Round(itemsTotal - order.DiscountAmount + order.ServiceChargeAmount, 2);
        order.AmountDue = Math.Round(order.Total - order.AmountPaid, 2);
    }

    private static string GenerateOrderNumber()
        => $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

    private static OrderDto MapToDto(Order order) => new()
    {
        Id = order.Id,
        OrderNumber = order.OrderNumber,
        Status = order.Status.ToString(),
        OrderType = order.OrderType.ToString(),
        // Branch Snapshot
        BranchId = order.BranchId,
        BranchName = order.BranchName,
        BranchAddress = order.BranchAddress,
        BranchPhone = order.BranchPhone,
        // Currency
        CurrencyCode = order.CurrencyCode,
        // Totals
        Subtotal = order.Subtotal,
        DiscountType = order.DiscountType,
        DiscountValue = order.DiscountValue,
        DiscountAmount = order.DiscountAmount,
        DiscountCode = order.DiscountCode,
        TaxRate = order.TaxRate,
        TaxAmount = order.TaxAmount,
        ServiceChargePercent = order.ServiceChargePercent,
        ServiceChargeAmount = order.ServiceChargeAmount,
        Total = order.Total,
        AmountPaid = order.AmountPaid,
        AmountDue = order.AmountDue,
        ChangeAmount = order.ChangeAmount,
        // Customer
        CustomerName = order.CustomerName,
        CustomerPhone = order.CustomerPhone,
        CustomerId = order.CustomerId,
        Notes = order.Notes,
        // User
        UserId = order.UserId,
        UserName = order.UserName,
        // Shift
        ShiftId = order.ShiftId,
        // Timestamps
        CreatedAt = order.CreatedAt,
        CompletedAt = order.CompletedAt,
        CancelledAt = order.CancelledAt,
        CancellationReason = order.CancellationReason,
        Items = order.Items.Select(i => new OrderItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            ProductNameEn = i.ProductNameEn,
            ProductSku = i.ProductSku,
            ProductBarcode = i.ProductBarcode,
            UnitPrice = i.UnitPrice,
            OriginalPrice = i.OriginalPrice,
            Quantity = i.Quantity,
            DiscountType = i.DiscountType,
            DiscountValue = i.DiscountValue,
            DiscountAmount = i.DiscountAmount,
            DiscountReason = i.DiscountReason,
            TaxRate = i.TaxRate,
            TaxAmount = i.TaxAmount,
            TaxInclusive = i.TaxInclusive,
            Subtotal = i.Subtotal,
            Total = i.Total,
            Notes = i.Notes
        }).ToList(),
        Payments = order.Payments?.Select(p => new PaymentDto
        {
            Id = p.Id,
            Method = p.Method.ToString(),
            Amount = p.Amount,
            Reference = p.Reference
        }).ToList() ?? new()
    };
}
