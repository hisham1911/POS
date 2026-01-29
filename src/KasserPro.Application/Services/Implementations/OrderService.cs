namespace KasserPro.Application.Services.Implementations;

using Microsoft.EntityFrameworkCore;
using KasserPro.Application.Common;
using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs;
using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.Orders;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Entities;
using KasserPro.Domain.Enums;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;
    private readonly IInventoryService _inventoryService;
    private readonly ICustomerService _customerService;
    private readonly ICashRegisterService _cashRegisterService;

    // Valid state transitions
    private static readonly Dictionary<OrderStatus, OrderStatus[]> ValidTransitions = new()
    {
        { OrderStatus.Draft, new[] { OrderStatus.Pending, OrderStatus.Completed, OrderStatus.Cancelled } },
        { OrderStatus.Pending, new[] { OrderStatus.Completed, OrderStatus.Cancelled } },
        { OrderStatus.Completed, new[] { OrderStatus.Refunded } },
        { OrderStatus.Cancelled, Array.Empty<OrderStatus>() },
        { OrderStatus.Refunded, Array.Empty<OrderStatus>() }
    };

    public OrderService(IUnitOfWork unitOfWork, ICurrentUserService currentUser, IInventoryService inventoryService, ICustomerService customerService, ICashRegisterService cashRegisterService)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _inventoryService = inventoryService;
        _customerService = customerService;
        _cashRegisterService = cashRegisterService;
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

        // CUSTOMER LOOKUP: If CustomerId is provided, fetch customer details for snapshot
        string? customerName = request.CustomerName;
        string? customerPhone = request.CustomerPhone;
        
        if (request.CustomerId.HasValue)
        {
            var customer = await _unitOfWork.Customers.GetByIdAsync(request.CustomerId.Value);
            if (customer != null && customer.TenantId == tenantId)
            {
                // Use customer data as fallback if not provided in request
                customerName ??= customer.Name;
                customerPhone ??= customer.Phone;
            }
        }

        var order = new Order
        {
            TenantId = tenantId,
            BranchId = branchId,
            // SHIFT LINKING: Link order to current shift
            ShiftId = currentShift.Id,
            OrderNumber = GenerateOrderNumber(),
            UserId = userId,
            // CUSTOMER LINKING: Link order to customer if provided
            CustomerId = request.CustomerId,
            CustomerName = customerName,
            CustomerPhone = customerPhone,
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

            // STOCK VALIDATION: Check if sufficient stock is available
            if (product.TrackInventory)
            {
                var currentStock = product.StockQuantity ?? 0;
                if (currentStock < item.Quantity && !tenant.AllowNegativeStock)
                {
                    return ApiResponse<OrderDto>.Fail(ErrorCodes.INSUFFICIENT_STOCK, 
                        $"المخزون غير كافٍ للمنتج: {product.Name}. المتاح: {currentStock}، المطلوب: {item.Quantity}");
                }
            }

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

    public async Task<ApiResponse<PagedResult<OrderDto>>> GetAllAsync(string? status = null, DateTime? fromDate = null, DateTime? toDate = null, int page = 1, int pageSize = 20)
    {
        var tenantId = _currentUser.TenantId;
        var branchId = _currentUser.BranchId;
        
        var query = _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .Include(o => o.Payments)
            .Where(o => o.TenantId == tenantId && o.BranchId == branchId);

        // Apply status filter
        if (!string.IsNullOrWhiteSpace(status))
        {
            if (Enum.TryParse<OrderStatus>(status, true, out var orderStatus))
            {
                query = query.Where(o => o.Status == orderStatus);
            }
        }

        // Apply date range filter
        if (fromDate.HasValue)
        {
            var fromDateUtc = fromDate.Value.Date;
            query = query.Where(o => o.CreatedAt >= fromDateUtc);
        }

        if (toDate.HasValue)
        {
            var toDateUtc = toDate.Value.Date.AddDays(1).AddTicks(-1); // End of day
            query = query.Where(o => o.CreatedAt <= toDateUtc);
        }

        // Get total count
        var totalCount = await query.CountAsync();

        // Apply pagination
        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new PagedResult<OrderDto>(
            orders.Select(MapToDto).ToList(),
            totalCount,
            page,
            pageSize
        );

        return ApiResponse<PagedResult<OrderDto>>.Ok(result);
    }

    public async Task<ApiResponse<PagedResult<OrderDto>>> GetByCustomerIdAsync(int customerId, int page = 1, int pageSize = 10)
    {
        var tenantId = _currentUser.TenantId;
        
        var query = _unitOfWork.Orders.Query()
            .Include(o => o.Items)
            .Include(o => o.Payments)
            .Where(o => o.TenantId == tenantId && o.CustomerId == customerId);
        
        var totalCount = await query.CountAsync();
        
        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new PagedResult<OrderDto>(
            orders.Select(MapToDto).ToList(),
            totalCount,
            page,
            pageSize
        );

        return ApiResponse<PagedResult<OrderDto>>.Ok(result);
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

        // STOCK VALIDATION: Check if sufficient stock is available
        if (product.TrackInventory)
        {
            var currentStock = product.StockQuantity ?? 0;
            // Calculate total quantity in order for this product
            var existingQty = order.Items.Where(i => i.ProductId == product.Id).Sum(i => i.Quantity);
            var totalRequested = existingQty + request.Quantity;
            
            if (currentStock < totalRequested && tenant?.AllowNegativeStock != true)
            {
                var available = Math.Max(0, currentStock - existingQty);
                return ApiResponse<OrderDto>.Fail(ErrorCodes.INSUFFICIENT_STOCK, 
                    $"المخزون غير كافٍ للمنتج: {product.Name}. المتاح: {available}، المطلوب: {request.Quantity}");
            }
        }

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
            decimal cashPaymentAmount = 0;
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
                
                // Track cash payments for cash register
                if (payment.Method == PaymentMethod.Cash)
                    cashPaymentAmount += payment.Amount;
            }

            // Update order status and payment info
            order.Status = OrderStatus.Completed;
            order.AmountPaid = Math.Round(totalPaid, 2);
            order.AmountDue = Math.Round(order.Total - totalPaid, 2);
            order.ChangeAmount = totalPaid > order.Total ? Math.Round(totalPaid - order.Total, 2) : 0;
            order.CompletedAt = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync();
            
            // Sellable V1: Decrement stock for all items in the order
            // This runs within the same transaction for data integrity
            var stockItems = order.Items
                .Where(i => i.ProductId > 0)
                .Select(i => (i.ProductId, i.Quantity))
                .ToList();
            
            if (stockItems.Any())
            {
                await _inventoryService.BatchDecrementStockAsync(stockItems, order.Id);
            }
            
            // Update customer statistics if order has a customer
            if (order.CustomerId.HasValue)
            {
                // Calculate loyalty points: 1 point per 1 currency unit
                int loyaltyPoints = (int)Math.Floor(order.Total);
                await _customerService.UpdateOrderStatsAsync(order.CustomerId.Value, order.Total, loyaltyPoints);
            }
            
            // INTEGRATION: Record cash register transaction for cash payments
            if (cashPaymentAmount > 0)
            {
                await _cashRegisterService.RecordTransactionAsync(
                    type: CashRegisterTransactionType.Sale,
                    amount: cashPaymentAmount,
                    description: $"مبيعات - طلب #{order.OrderNumber}",
                    referenceType: "Order",
                    referenceId: order.Id,
                    shiftId: order.ShiftId
                );
            }
            
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

    /// <summary>
    /// Process a full or partial refund for a completed order.
    /// Creates a NEW Return Order with negative totals, restores stock, and creates audit trail.
    /// Original order status is updated to Refunded or PartiallyRefunded.
    /// </summary>
    public async Task<ApiResponse<OrderDto>> RefundAsync(int orderId, int userId, string? reason, List<RefundItemDto>? items = null)
    {
        var isPartialRefund = items != null && items.Count > 0;
        
        // For full refund, reason is required
        if (!isPartialRefund && string.IsNullOrWhiteSpace(reason))
            return ApiResponse<OrderDto>.Fail(ErrorCodes.VALIDATION_ERROR, "سبب الاسترجاع مطلوب للاسترجاع الكامل");

        // Use transaction for atomicity
        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        try
        {
            var originalOrder = await _unitOfWork.Orders.Query()
                .Include(o => o.Items)
                .Include(o => o.Payments)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.TenantId == _currentUser.TenantId);

            if (originalOrder == null)
                return ApiResponse<OrderDto>.Fail(ErrorCodes.ORDER_NOT_FOUND, ErrorMessages.Get(ErrorCodes.ORDER_NOT_FOUND));

            // Validate: Order must be Completed or PartiallyRefunded
            if (originalOrder.Status != OrderStatus.Completed && originalOrder.Status != OrderStatus.PartiallyRefunded)
                return ApiResponse<OrderDto>.Fail(ErrorCodes.ORDER_INVALID_STATE_TRANSITION, 
                    "يمكن استرجاع الطلبات المكتملة أو المستردة جزئياً فقط");

            // Get user for snapshot
            var refundUser = await _unitOfWork.Users.GetByIdAsync(userId);
            if (refundUser == null)
                return ApiResponse<OrderDto>.Fail(ErrorCodes.USER_NOT_FOUND, ErrorMessages.Get(ErrorCodes.USER_NOT_FOUND));

            // Get current shift (optional for return orders)
            var currentShift = await _unitOfWork.Shifts.Query()
                .FirstOrDefaultAsync(s => s.TenantId == _currentUser.TenantId 
                                       && s.BranchId == _currentUser.BranchId 
                                       && s.UserId == userId
                                       && !s.IsClosed);

            // Build stock changes JSON for audit trail
            var stockChanges = new List<object>();
            decimal totalRefundAmount = 0;
            var refundReason = reason ?? "";

            // Create the Return Order
            var returnOrder = new Order
            {
                TenantId = originalOrder.TenantId,
                BranchId = originalOrder.BranchId,
                ShiftId = currentShift?.Id,
                OrderNumber = GenerateReturnOrderNumber(),
                UserId = userId,
                UserName = refundUser.Name,
                // Link to original customer
                CustomerId = originalOrder.CustomerId,
                CustomerName = originalOrder.CustomerName,
                CustomerPhone = originalOrder.CustomerPhone,
                // Return order type
                OrderType = OrderType.Return,
                Status = OrderStatus.Completed,
                // Branch Snapshot from original order
                BranchName = originalOrder.BranchName,
                BranchAddress = originalOrder.BranchAddress,
                BranchPhone = originalOrder.BranchPhone,
                CurrencyCode = originalOrder.CurrencyCode,
                TaxRate = originalOrder.TaxRate,
                // Notes linking to original order
                Notes = $"مرتجع للطلب #{originalOrder.OrderNumber}" + 
                        (string.IsNullOrWhiteSpace(refundReason) ? "" : $" - السبب: {refundReason}"),
                CompletedAt = DateTime.UtcNow
            };

            if (isPartialRefund)
            {
                // PARTIAL REFUND - Only specified items
                foreach (var refundItem in items!)
                {
                    var orderItem = originalOrder.Items.FirstOrDefault(i => i.Id == refundItem.ItemId);
                    if (orderItem == null)
                        return ApiResponse<OrderDto>.Fail(ErrorCodes.VALIDATION_ERROR, 
                            $"عنصر الطلب رقم {refundItem.ItemId} غير موجود");

                    if (refundItem.Quantity <= 0)
                        return ApiResponse<OrderDto>.Fail(ErrorCodes.VALIDATION_ERROR, 
                            "كمية الاسترجاع يجب أن تكون أكبر من صفر");

                    if (refundItem.Quantity > orderItem.Quantity)
                        return ApiResponse<OrderDto>.Fail(ErrorCodes.VALIDATION_ERROR, 
                            $"كمية الاسترجاع ({refundItem.Quantity}) أكبر من الكمية المتاحة ({orderItem.Quantity}) للمنتج {orderItem.ProductName}");

                    // Calculate refund amount for this item (proportional)
                    var unitPriceWithTax = orderItem.Total / orderItem.Quantity;
                    var itemRefundAmount = unitPriceWithTax * refundItem.Quantity;
                    totalRefundAmount += itemRefundAmount;

                    // Add NEGATIVE item to return order
                    var returnItem = new OrderItem
                    {
                        ProductId = orderItem.ProductId,
                        ProductName = orderItem.ProductName,
                        ProductNameEn = orderItem.ProductNameEn,
                        ProductSku = orderItem.ProductSku,
                        ProductBarcode = orderItem.ProductBarcode,
                        UnitPrice = -orderItem.UnitPrice, // Negative price
                        UnitCost = orderItem.UnitCost,
                        OriginalPrice = orderItem.OriginalPrice,
                        Quantity = refundItem.Quantity,
                        TaxRate = orderItem.TaxRate,
                        TaxInclusive = orderItem.TaxInclusive,
                        DiscountType = orderItem.DiscountType,
                        DiscountValue = orderItem.DiscountValue,
                        DiscountAmount = -Math.Round((orderItem.DiscountAmount / orderItem.Quantity) * refundItem.Quantity, 2),
                        TaxAmount = -Math.Round((orderItem.TaxAmount / orderItem.Quantity) * refundItem.Quantity, 2),
                        Subtotal = -Math.Round((orderItem.Subtotal / orderItem.Quantity) * refundItem.Quantity, 2),
                        Total = -Math.Round(itemRefundAmount, 2),
                        Notes = refundItem.Reason ?? refundReason
                    };
                    returnOrder.Items.Add(returnItem);

                    // Restore stock
                    if (orderItem.ProductId > 0)
                    {
                        var currentStock = await _inventoryService.GetCurrentStockAsync(orderItem.ProductId);
                        var newStock = await _inventoryService.IncrementStockAsync(orderItem.ProductId, refundItem.Quantity, originalOrder.Id);
                        
                        stockChanges.Add(new 
                        { 
                            ProductId = orderItem.ProductId, 
                            ProductName = orderItem.ProductName,
                            Quantity = refundItem.Quantity,
                            BalanceBefore = currentStock, 
                            BalanceAfter = newStock,
                            Reason = refundItem.Reason ?? refundReason
                        });
                    }

                    // Build combined reason
                    if (!string.IsNullOrWhiteSpace(refundItem.Reason))
                    {
                        refundReason += (string.IsNullOrEmpty(refundReason) ? "" : " | ") + 
                            $"{orderItem.ProductName}: {refundItem.Reason}";
                    }
                }

                // Update original order for partial refund
                originalOrder.RefundAmount += totalRefundAmount;
                originalOrder.Status = OrderStatus.PartiallyRefunded;
            }
            else
            {
                // FULL REFUND - All items
                foreach (var item in originalOrder.Items)
                {
                    // Add NEGATIVE item to return order
                    var returnItem = new OrderItem
                    {
                        ProductId = item.ProductId,
                        ProductName = item.ProductName,
                        ProductNameEn = item.ProductNameEn,
                        ProductSku = item.ProductSku,
                        ProductBarcode = item.ProductBarcode,
                        UnitPrice = -item.UnitPrice,
                        UnitCost = item.UnitCost,
                        OriginalPrice = item.OriginalPrice,
                        Quantity = item.Quantity,
                        TaxRate = item.TaxRate,
                        TaxInclusive = item.TaxInclusive,
                        DiscountType = item.DiscountType,
                        DiscountValue = item.DiscountValue,
                        DiscountAmount = -item.DiscountAmount,
                        TaxAmount = -item.TaxAmount,
                        Subtotal = -item.Subtotal,
                        Total = -item.Total,
                        Notes = refundReason
                    };
                    returnOrder.Items.Add(returnItem);

                    // Restore stock
                    if (item.ProductId > 0 && item.Quantity > 0)
                    {
                        var currentStock = await _inventoryService.GetCurrentStockAsync(item.ProductId);
                        var newStock = await _inventoryService.IncrementStockAsync(item.ProductId, item.Quantity, originalOrder.Id);
                        
                        stockChanges.Add(new 
                        { 
                            ProductId = item.ProductId, 
                            ProductName = item.ProductName,
                            Quantity = item.Quantity, 
                            BalanceBefore = currentStock, 
                            BalanceAfter = newStock 
                        });
                    }
                }

                totalRefundAmount = originalOrder.Total;
                originalOrder.RefundAmount = totalRefundAmount;
                originalOrder.Status = OrderStatus.Refunded;
            }

            // Set return order totals (all negative)
            returnOrder.Subtotal = returnOrder.Items.Sum(i => i.Subtotal);
            returnOrder.TaxAmount = returnOrder.Items.Sum(i => i.TaxAmount);
            returnOrder.DiscountAmount = returnOrder.Items.Sum(i => i.DiscountAmount);
            returnOrder.Total = returnOrder.Items.Sum(i => i.Total);
            returnOrder.AmountPaid = returnOrder.Total; // Negative payment (refund given)
            returnOrder.AmountDue = 0;
            returnOrder.ChangeAmount = 0;

            // Update original order metadata
            originalOrder.RefundedAt = DateTime.UtcNow;
            originalOrder.RefundReason = string.IsNullOrWhiteSpace(originalOrder.RefundReason) 
                ? refundReason 
                : originalOrder.RefundReason + " | " + refundReason;
            originalOrder.RefundedByUserId = userId;
            originalOrder.RefundedByUserName = refundUser.Name;

            // Save the return order
            await _unitOfWork.Orders.AddAsync(returnOrder);

            // Create RefundLog entry for audit trail
            var refundLog = new RefundLog
            {
                TenantId = _currentUser.TenantId,
                BranchId = _currentUser.BranchId,
                OrderId = originalOrder.Id,
                UserId = userId,
                RefundAmount = totalRefundAmount,
                Reason = refundReason,
                StockChangesJson = System.Text.Json.JsonSerializer.Serialize(stockChanges)
            };
            await _unitOfWork.RefundLogs.AddAsync(refundLog);

            // Deduct loyalty points for refunded amount
            if (originalOrder.CustomerId.HasValue)
            {
                int pointsToDeduct = (int)Math.Floor(totalRefundAmount);
                await _customerService.DeductRefundStatsAsync(
                    originalOrder.CustomerId.Value, 
                    totalRefundAmount,
                    pointsToDeduct
                );
            }

            await _unitOfWork.SaveChangesAsync();
            
            // INTEGRATION: Record cash register transaction for cash refunds
            // Calculate cash refund amount from original order's cash payments
            var originalCashPayments = originalOrder.Payments
                .Where(p => p.Method == PaymentMethod.Cash)
                .Sum(p => p.Amount);
            
            if (originalCashPayments > 0)
            {
                // Calculate proportional cash refund
                var cashRefundAmount = isPartialRefund 
                    ? Math.Round((totalRefundAmount / originalOrder.Total) * originalCashPayments, 2)
                    : originalCashPayments;
                
                if (cashRefundAmount > 0)
                {
                    await _cashRegisterService.RecordTransactionAsync(
                        type: CashRegisterTransactionType.Refund,
                        amount: -cashRefundAmount, // Negative amount for cash outflow
                        description: $"مرتجع - طلب #{originalOrder.OrderNumber}",
                        referenceType: "Order",
                        referenceId: returnOrder.Id,
                        shiftId: currentShift?.Id
                    );
                }
            }
            
            await transaction.CommitAsync();

            // Update original order notes with return order reference
            originalOrder.Notes = string.IsNullOrWhiteSpace(originalOrder.Notes)
                ? $"تم إنشاء مرتجع: #{returnOrder.OrderNumber}"
                : originalOrder.Notes + $" | تم إنشاء مرتجع: #{returnOrder.OrderNumber}";
            await _unitOfWork.SaveChangesAsync();

            var message = isPartialRefund 
                ? $"تم إنشاء فاتورة المرتجع الجزئي #{returnOrder.OrderNumber}" 
                : $"تم إنشاء فاتورة المرتجع #{returnOrder.OrderNumber}";
            
            // Return the NEW return order (not the original)
            return ApiResponse<OrderDto>.Ok(MapToDto(returnOrder), message);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return ApiResponse<OrderDto>.Fail(ErrorCodes.SYSTEM_INTERNAL_ERROR, 
                $"حدث خطأ أثناء استرجاع الطلب: {ex.Message}");
        }
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

    private static string GenerateReturnOrderNumber()
        => $"RET-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

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
        // Refund Information
        RefundedAt = order.RefundedAt,
        RefundReason = order.RefundReason,
        RefundAmount = order.RefundAmount,
        RefundedByUserId = order.RefundedByUserId,
        RefundedByUserName = order.RefundedByUserName,
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
