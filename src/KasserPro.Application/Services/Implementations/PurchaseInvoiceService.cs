namespace KasserPro.Application.Services.Implementations;

using KasserPro.Application.Common;
using KasserPro.Application.Common.Interfaces;
using KasserPro.Application.DTOs.Common;
using KasserPro.Application.DTOs.PurchaseInvoices;
using KasserPro.Application.Services.Interfaces;
using KasserPro.Domain.Entities;
using KasserPro.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

public class PurchaseInvoiceService : IPurchaseInvoiceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<PurchaseInvoiceService> _logger;
    private readonly ICashRegisterService _cashRegisterService;

    public PurchaseInvoiceService(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ILogger<PurchaseInvoiceService> logger,
        ICashRegisterService cashRegisterService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _logger = logger;
        _cashRegisterService = cashRegisterService;
    }

    public async Task<ApiResponse<PagedResult<PurchaseInvoiceDto>>> GetAllAsync(
        int? supplierId = null,
        PurchaseInvoiceStatus? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int pageNumber = 1,
        int pageSize = 20)
    {
        try
        {
            var query = _unitOfWork.PurchaseInvoices.Query()
                .Where(pi => pi.TenantId == _currentUserService.TenantId)
                .Include(pi => pi.Supplier)
                .Include(pi => pi.Items)
                .Include(pi => pi.Payments)
                .AsQueryable();

            // Apply filters
            if (supplierId.HasValue)
                query = query.Where(pi => pi.SupplierId == supplierId.Value);

            if (status.HasValue)
                query = query.Where(pi => pi.Status == status.Value);

            if (fromDate.HasValue)
                query = query.Where(pi => pi.InvoiceDate >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(pi => pi.InvoiceDate <= toDate.Value);

            // Order by date descending
            query = query.OrderByDescending(pi => pi.InvoiceDate);

            // Pagination
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = items.Select(MapToDto).ToList();

            var pagedResult = new PagedResult<PurchaseInvoiceDto>(dtos, totalCount, pageNumber, pageSize);

            return ApiResponse<PagedResult<PurchaseInvoiceDto>>.Ok(pagedResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting purchase invoices");
            return ApiResponse<PagedResult<PurchaseInvoiceDto>>.Fail(ErrorCodes.INTERNAL_ERROR);
        }
    }

    public async Task<ApiResponse<PurchaseInvoiceDto>> GetByIdAsync(int id)
    {
        try
        {
            var invoice = await _unitOfWork.PurchaseInvoices.Query()
                .Where(pi => pi.Id == id && pi.TenantId == _currentUserService.TenantId)
                .Include(pi => pi.Supplier)
                .Include(pi => pi.Items)
                .Include(pi => pi.Payments)
                .FirstOrDefaultAsync();

            if (invoice == null)
                return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.PURCHASE_INVOICE_NOT_FOUND);

            return ApiResponse<PurchaseInvoiceDto>.Ok(MapToDto(invoice));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting purchase invoice {Id}", id);
            return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.INTERNAL_ERROR);
        }
    }

    public async Task<ApiResponse<PurchaseInvoiceDto>> CreateAsync(CreatePurchaseInvoiceRequest request)
    {
        var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            // Validate supplier exists
            var supplier = await _unitOfWork.Suppliers.Query()
                .FirstOrDefaultAsync(s => s.Id == request.SupplierId && s.TenantId == _currentUserService.TenantId);
            
            if (supplier == null)
                return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.SUPPLIER_NOT_FOUND);

            // Validate items
            if (request.Items == null || request.Items.Count == 0)
                return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.PURCHASE_INVOICE_EMPTY);

            // Get tenant for tax settings
            var tenant = await _unitOfWork.Tenants.Query()
                .FirstOrDefaultAsync(t => t.Id == _currentUserService.TenantId);

            // Get user name
            var user = await _unitOfWork.Users.Query()
                .FirstOrDefaultAsync(u => u.Id == _currentUserService.UserId);

            // Generate invoice number
            var invoiceNumber = await GenerateInvoiceNumberAsync();

            // Create invoice
            var invoice = new PurchaseInvoice
            {
                TenantId = _currentUserService.TenantId,
                BranchId = _currentUserService.BranchId,
                InvoiceNumber = invoiceNumber,
                SupplierId = request.SupplierId,
                SupplierName = supplier.Name,
                SupplierPhone = supplier.Phone,
                SupplierAddress = supplier.Address,
                InvoiceDate = request.InvoiceDate,
                Status = PurchaseInvoiceStatus.Draft,
                Notes = request.Notes,
                CreatedByUserId = _currentUserService.UserId,
                CreatedByUserName = user?.Name ?? _currentUserService.Email ?? "Unknown"
            };

            // Add items
            foreach (var itemRequest in request.Items)
            {
                var product = await _unitOfWork.Products.Query()
                    .FirstOrDefaultAsync(p => p.Id == itemRequest.ProductId && p.TenantId == _currentUserService.TenantId);

                if (product == null)
                    return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.PRODUCT_NOT_FOUND);

                var item = new PurchaseInvoiceItem
                {
                    ProductId = itemRequest.ProductId,
                    ProductName = product.Name,
                    ProductNameEn = product.NameEn,
                    ProductSku = product.Sku,
                    ProductBarcode = product.Barcode,
                    Quantity = itemRequest.Quantity,
                    PurchasePrice = itemRequest.PurchasePrice,
                    Total = itemRequest.Quantity * itemRequest.PurchasePrice,
                    Notes = itemRequest.Notes
                };

                invoice.Items.Add(item);
            }

            // Calculate totals
            CalculateTotals(invoice, tenant!);

            await _unitOfWork.PurchaseInvoices.AddAsync(invoice);
            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            // Reload with includes
            var createdInvoice = await _unitOfWork.PurchaseInvoices.Query()
                .Where(pi => pi.Id == invoice.Id)
                .Include(pi => pi.Supplier)
                .Include(pi => pi.Items)
                .Include(pi => pi.Payments)
                .FirstAsync();

            return ApiResponse<PurchaseInvoiceDto>.Ok(MapToDto(createdInvoice));
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error creating purchase invoice");
            return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.INTERNAL_ERROR);
        }
    }

    public async Task<ApiResponse<PurchaseInvoiceDto>> UpdateAsync(int id, UpdatePurchaseInvoiceRequest request)
    {
        var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var invoice = await _unitOfWork.PurchaseInvoices.Query()
                .Where(pi => pi.Id == id && pi.TenantId == _currentUserService.TenantId)
                .Include(pi => pi.Items)
                .FirstOrDefaultAsync();

            if (invoice == null)
                return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.PURCHASE_INVOICE_NOT_FOUND);

            // Can only edit Draft invoices
            if (invoice.Status != PurchaseInvoiceStatus.Draft)
                return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.PURCHASE_INVOICE_NOT_EDITABLE);

            // Validate supplier
            var supplier = await _unitOfWork.Suppliers.Query()
                .FirstOrDefaultAsync(s => s.Id == request.SupplierId && s.TenantId == _currentUserService.TenantId);
            
            if (supplier == null)
                return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.SUPPLIER_NOT_FOUND);

            // Update invoice
            invoice.SupplierId = request.SupplierId;
            invoice.SupplierName = supplier.Name;
            invoice.SupplierPhone = supplier.Phone;
            invoice.SupplierAddress = supplier.Address;
            invoice.InvoiceDate = request.InvoiceDate;
            invoice.Notes = request.Notes;

            // Update items - remove old items
            var itemsToRemove = invoice.Items.ToList();
            foreach (var item in itemsToRemove)
            {
                _unitOfWork.PurchaseInvoiceItems.Delete(item);
            }
            invoice.Items.Clear();

            // Add new items
            foreach (var itemRequest in request.Items)
            {
                var product = await _unitOfWork.Products.Query()
                    .FirstOrDefaultAsync(p => p.Id == itemRequest.ProductId && p.TenantId == _currentUserService.TenantId);

                if (product == null)
                    return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.PRODUCT_NOT_FOUND);

                var item = new PurchaseInvoiceItem
                {
                    ProductId = itemRequest.ProductId,
                    ProductName = product.Name,
                    ProductNameEn = product.NameEn,
                    ProductSku = product.Sku,
                    ProductBarcode = product.Barcode,
                    Quantity = itemRequest.Quantity,
                    PurchasePrice = itemRequest.PurchasePrice,
                    Total = itemRequest.Quantity * itemRequest.PurchasePrice,
                    Notes = itemRequest.Notes
                };

                invoice.Items.Add(item);
            }

            // Recalculate totals
            var tenant = await _unitOfWork.Tenants.Query()
                .FirstOrDefaultAsync(t => t.Id == _currentUserService.TenantId);
            CalculateTotals(invoice, tenant!);

            _unitOfWork.PurchaseInvoices.Update(invoice);
            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            // Reload with includes
            var updatedInvoice = await _unitOfWork.PurchaseInvoices.Query()
                .Where(pi => pi.Id == invoice.Id)
                .Include(pi => pi.Supplier)
                .Include(pi => pi.Items)
                .Include(pi => pi.Payments)
                .FirstAsync();

            return ApiResponse<PurchaseInvoiceDto>.Ok(MapToDto(updatedInvoice));
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error updating purchase invoice {Id}", id);
            return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.INTERNAL_ERROR);
        }
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var invoice = await _unitOfWork.PurchaseInvoices.Query()
                .FirstOrDefaultAsync(pi => pi.Id == id && pi.TenantId == _currentUserService.TenantId);

            if (invoice == null)
                return ApiResponse<bool>.Fail(ErrorCodes.PURCHASE_INVOICE_NOT_FOUND);

            // Can only delete Draft invoices
            if (invoice.Status != PurchaseInvoiceStatus.Draft)
                return ApiResponse<bool>.Fail(ErrorCodes.PURCHASE_INVOICE_NOT_DELETABLE);

            _unitOfWork.PurchaseInvoices.Delete(invoice);
            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            return ApiResponse<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error deleting purchase invoice {Id}", id);
            return ApiResponse<bool>.Fail(ErrorCodes.INTERNAL_ERROR);
        }
    }

    public async Task<ApiResponse<PurchaseInvoiceDto>> ConfirmAsync(int id)
    {
        var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var invoice = await _unitOfWork.PurchaseInvoices.Query()
                .Where(pi => pi.Id == id && pi.TenantId == _currentUserService.TenantId)
                .Include(pi => pi.Items)
                .Include(pi => pi.Supplier)
                .FirstOrDefaultAsync();

            if (invoice == null)
                return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.PURCHASE_INVOICE_NOT_FOUND);

            // Validate: Can only confirm Draft invoices
            if (invoice.Status != PurchaseInvoiceStatus.Draft)
                return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.PURCHASE_INVOICE_ALREADY_CONFIRMED);

            // Get user name
            var user = await _unitOfWork.Users.Query()
                .FirstOrDefaultAsync(u => u.Id == _currentUserService.UserId);

            // Update inventory for each item
            foreach (var item in invoice.Items)
            {
                var product = await _unitOfWork.Products.Query()
                    .FirstOrDefaultAsync(p => p.Id == item.ProductId);

                if (product == null)
                    continue;

                // Calculate balance before
                var balanceBefore = product.StockQuantity ?? 0;

                if (product.TrackInventory)
                {
                    product.StockQuantity = (product.StockQuantity ?? 0) + item.Quantity;
                    product.LastStockUpdate = DateTime.UtcNow;
                }

                // Update cost tracking
                product.LastPurchasePrice = item.PurchasePrice;
                product.LastPurchaseDate = invoice.InvoiceDate;

                // Update average cost (weighted average)
                if (product.AverageCost.HasValue && product.StockQuantity.HasValue && product.StockQuantity > 0)
                {
                    var oldStock = product.StockQuantity.Value - item.Quantity;
                    var oldTotalCost = product.AverageCost.Value * oldStock;
                    var newTotalCost = oldTotalCost + (item.PurchasePrice * item.Quantity);
                    product.AverageCost = newTotalCost / product.StockQuantity.Value;
                }
                else
                {
                    product.AverageCost = item.PurchasePrice;
                }

                _unitOfWork.Products.Update(product);

                // Create stock movement
                var movement = new StockMovement
                {
                    TenantId = invoice.TenantId,
                    BranchId = invoice.BranchId,
                    ProductId = item.ProductId,
                    Type = StockMovementType.Receiving,
                    Quantity = item.Quantity,
                    ReferenceType = "PurchaseInvoice",
                    ReferenceId = invoice.Id,
                    Reason = $"Purchase Invoice {invoice.InvoiceNumber}",
                    BalanceBefore = balanceBefore,
                    BalanceAfter = product.StockQuantity ?? 0,
                    UserId = _currentUserService.UserId
                };
                await _unitOfWork.StockMovements.AddAsync(movement);

                // Update SupplierProduct
                var supplierProduct = await _unitOfWork.SupplierProducts.Query()
                    .FirstOrDefaultAsync(sp => sp.SupplierId == invoice.SupplierId && 
                                              sp.ProductId == item.ProductId);

                if (supplierProduct != null)
                {
                    supplierProduct.LastPurchasePrice = item.PurchasePrice;
                    supplierProduct.LastPurchaseDate = invoice.InvoiceDate;
                    supplierProduct.TotalQuantityPurchased += item.Quantity;
                    supplierProduct.TotalAmountSpent += item.Total;
                    _unitOfWork.SupplierProducts.Update(supplierProduct);
                }
            }

            // Update invoice status
            invoice.Status = PurchaseInvoiceStatus.Confirmed;
            invoice.ConfirmedByUserId = _currentUserService.UserId;
            invoice.ConfirmedByUserName = user?.Name ?? _currentUserService.Email ?? "Unknown";
            invoice.ConfirmedAt = DateTime.UtcNow;

            _unitOfWork.PurchaseInvoices.Update(invoice);

            // Update supplier totals
            var supplier = invoice.Supplier;
            supplier.TotalPurchases += invoice.Total;
            supplier.TotalDue += invoice.AmountDue;
            supplier.LastPurchaseDate = invoice.InvoiceDate;
            _unitOfWork.Suppliers.Update(supplier);

            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            // Reload with includes
            var confirmedInvoice = await _unitOfWork.PurchaseInvoices.Query()
                .Where(pi => pi.Id == invoice.Id)
                .Include(pi => pi.Supplier)
                .Include(pi => pi.Items)
                .Include(pi => pi.Payments)
                .FirstAsync();

            return ApiResponse<PurchaseInvoiceDto>.Ok(MapToDto(confirmedInvoice));
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error confirming purchase invoice {Id}", id);
            return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.INTERNAL_ERROR);
        }
    }

    public async Task<ApiResponse<PurchaseInvoiceDto>> CancelAsync(int id, CancelInvoiceRequest request)
    {
        var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var invoice = await _unitOfWork.PurchaseInvoices.Query()
                .Where(pi => pi.Id == id && pi.TenantId == _currentUserService.TenantId)
                .Include(pi => pi.Items)
                .Include(pi => pi.Supplier)
                .FirstOrDefaultAsync();

            if (invoice == null)
                return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.PURCHASE_INVOICE_NOT_FOUND);

            // Validate: Cannot cancel already cancelled invoice
            if (invoice.Status == PurchaseInvoiceStatus.Cancelled)
                return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.PURCHASE_INVOICE_ALREADY_CANCELLED);

            // Get user name
            var user = await _unitOfWork.Users.Query()
                .FirstOrDefaultAsync(u => u.Id == _currentUserService.UserId);

            // If confirmed and user wants to adjust inventory
            if (invoice.Status == PurchaseInvoiceStatus.Confirmed && request.AdjustInventory)
            {
                foreach (var item in invoice.Items)
                {
                    var product = await _unitOfWork.Products.Query()
                        .FirstOrDefaultAsync(p => p.Id == item.ProductId);

                    if (product != null && product.TrackInventory)
                    {
                        var balanceBefore = product.StockQuantity ?? 0;
                        product.StockQuantity = (product.StockQuantity ?? 0) - item.Quantity;
                        product.LastStockUpdate = DateTime.UtcNow;
                        _unitOfWork.Products.Update(product);

                        // Create stock movement
                        var movement = new StockMovement
                        {
                            TenantId = invoice.TenantId,
                            BranchId = invoice.BranchId,
                            ProductId = item.ProductId,
                            Type = StockMovementType.Adjustment,
                            Quantity = -item.Quantity,
                            ReferenceType = "PurchaseInvoiceCancellation",
                            ReferenceId = invoice.Id,
                            Reason = $"Cancelled Purchase Invoice {invoice.InvoiceNumber}: {request.Reason}",
                            BalanceBefore = balanceBefore,
                            BalanceAfter = product.StockQuantity ?? 0,
                            UserId = _currentUserService.UserId
                        };
                        await _unitOfWork.StockMovements.AddAsync(movement);
                    }
                }

                invoice.InventoryAdjustedOnCancellation = true;
            }

            // Update invoice
            invoice.Status = PurchaseInvoiceStatus.Cancelled;
            invoice.CancelledByUserId = _currentUserService.UserId;
            invoice.CancelledByUserName = user?.Name ?? _currentUserService.Email ?? "Unknown";
            invoice.CancelledAt = DateTime.UtcNow;
            invoice.CancellationReason = request.Reason;

            _unitOfWork.PurchaseInvoices.Update(invoice);

            // Update supplier totals
            var supplier = invoice.Supplier;
            supplier.TotalDue -= invoice.AmountDue;
            _unitOfWork.Suppliers.Update(supplier);

            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            // Reload with includes
            var cancelledInvoice = await _unitOfWork.PurchaseInvoices.Query()
                .Where(pi => pi.Id == invoice.Id)
                .Include(pi => pi.Supplier)
                .Include(pi => pi.Items)
                .Include(pi => pi.Payments)
                .FirstAsync();

            return ApiResponse<PurchaseInvoiceDto>.Ok(MapToDto(cancelledInvoice));
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error cancelling purchase invoice {Id}", id);
            return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.INTERNAL_ERROR);
        }
    }

    public async Task<ApiResponse<PurchaseInvoicePaymentDto>> AddPaymentAsync(int invoiceId, AddPaymentRequest request)
    {
        var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var invoice = await _unitOfWork.PurchaseInvoices.Query()
                .Where(pi => pi.Id == invoiceId && pi.TenantId == _currentUserService.TenantId)
                .Include(pi => pi.Supplier)
                .FirstOrDefaultAsync();

            if (invoice == null)
                return ApiResponse<PurchaseInvoicePaymentDto>.Fail(ErrorCodes.PURCHASE_INVOICE_NOT_FOUND);

            // Validate amount
            if (request.Amount <= 0)
                return ApiResponse<PurchaseInvoicePaymentDto>.Fail(ErrorCodes.PAYMENT_INVALID_AMOUNT);

            if (request.Amount > invoice.AmountDue)
                return ApiResponse<PurchaseInvoicePaymentDto>.Fail(ErrorCodes.PAYMENT_EXCEEDS_DUE);

            // Get user name
            var user = await _unitOfWork.Users.Query()
                .FirstOrDefaultAsync(u => u.Id == _currentUserService.UserId);

            // Create payment
            var payment = new PurchaseInvoicePayment
            {
                PurchaseInvoiceId = invoiceId,
                Amount = request.Amount,
                PaymentDate = request.PaymentDate,
                Method = request.Method,
                ReferenceNumber = request.ReferenceNumber,
                Notes = request.Notes,
                CreatedByUserId = _currentUserService.UserId,
                CreatedByUserName = user?.Name ?? _currentUserService.Email ?? "Unknown"
            };

            await _unitOfWork.PurchaseInvoicePayments.AddAsync(payment);

            // Update invoice
            invoice.AmountPaid += request.Amount;
            invoice.AmountDue -= request.Amount;

            // Update status
            if (invoice.AmountDue == 0)
                invoice.Status = PurchaseInvoiceStatus.Paid;
            else if (invoice.AmountPaid > 0)
                invoice.Status = PurchaseInvoiceStatus.PartiallyPaid;

            _unitOfWork.PurchaseInvoices.Update(invoice);

            // Update supplier
            var supplier = invoice.Supplier;
            supplier.TotalPaid += request.Amount;
            supplier.TotalDue -= request.Amount;
            _unitOfWork.Suppliers.Update(supplier);

            await _unitOfWork.SaveChangesAsync();
            
            // INTEGRATION: Record cash register transaction for cash payments
            if (request.Method == PaymentMethod.Cash)
            {
                // Get current shift (optional for purchase invoice payments)
                var currentShift = await _unitOfWork.Shifts.Query()
                    .FirstOrDefaultAsync(s => s.TenantId == _currentUserService.TenantId 
                                           && s.BranchId == _currentUserService.BranchId 
                                           && s.UserId == _currentUserService.UserId
                                           && !s.IsClosed);
                
                await _cashRegisterService.RecordTransactionAsync(
                    type: CashRegisterTransactionType.SupplierPayment,
                    amount: -request.Amount, // Negative amount for cash outflow
                    description: $"دفع للمورد - فاتورة #{invoice.InvoiceNumber} - {supplier.Name}",
                    referenceType: "PurchaseInvoicePayment",
                    referenceId: payment.Id,
                    shiftId: currentShift?.Id
                );
            }
            
            await transaction.CommitAsync();

            var paymentDto = new PurchaseInvoicePaymentDto
            {
                Id = payment.Id,
                Amount = payment.Amount,
                PaymentDate = payment.PaymentDate,
                Method = payment.Method.ToString(),
                ReferenceNumber = payment.ReferenceNumber,
                Notes = payment.Notes,
                CreatedByUserName = payment.CreatedByUserName ?? string.Empty,
                CreatedAt = payment.CreatedAt
            };

            return ApiResponse<PurchaseInvoicePaymentDto>.Ok(paymentDto);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error adding payment to purchase invoice {InvoiceId}", invoiceId);
            return ApiResponse<PurchaseInvoicePaymentDto>.Fail(ErrorCodes.INTERNAL_ERROR);
        }
    }

    public async Task<ApiResponse<bool>> DeletePaymentAsync(int invoiceId, int paymentId)
    {
        var transaction = await _unitOfWork.BeginTransactionAsync();
        try
        {
            var payment = await _unitOfWork.PurchaseInvoicePayments.Query()
                .FirstOrDefaultAsync(p => p.Id == paymentId && p.PurchaseInvoiceId == invoiceId);

            if (payment == null)
                return ApiResponse<bool>.Fail(ErrorCodes.PAYMENT_NOT_FOUND);

            var invoice = await _unitOfWork.PurchaseInvoices.Query()
                .Where(pi => pi.Id == invoiceId)
                .Include(pi => pi.Supplier)
                .FirstOrDefaultAsync();

            if (invoice == null)
                return ApiResponse<bool>.Fail(ErrorCodes.PURCHASE_INVOICE_NOT_FOUND);

            // Store payment method before deletion for cash register reversal
            var wasPaymentCash = payment.Method == PaymentMethod.Cash;
            var paymentAmount = payment.Amount;

            // Update invoice
            invoice.AmountPaid -= payment.Amount;
            invoice.AmountDue += payment.Amount;

            // Update status
            if (invoice.AmountPaid == 0)
                invoice.Status = PurchaseInvoiceStatus.Confirmed;
            else if (invoice.AmountDue > 0)
                invoice.Status = PurchaseInvoiceStatus.PartiallyPaid;

            _unitOfWork.PurchaseInvoices.Update(invoice);

            // Update supplier
            var supplier = invoice.Supplier;
            supplier.TotalPaid -= payment.Amount;
            supplier.TotalDue += payment.Amount;
            _unitOfWork.Suppliers.Update(supplier);

            // Delete payment
            _unitOfWork.PurchaseInvoicePayments.Delete(payment);

            await _unitOfWork.SaveChangesAsync();
            
            // INTEGRATION: Reverse cash register transaction for cash payments
            if (wasPaymentCash)
            {
                // Get current shift (optional)
                var currentShift = await _unitOfWork.Shifts.Query()
                    .FirstOrDefaultAsync(s => s.TenantId == _currentUserService.TenantId 
                                           && s.BranchId == _currentUserService.BranchId 
                                           && s.UserId == _currentUserService.UserId
                                           && !s.IsClosed);
                
                await _cashRegisterService.RecordTransactionAsync(
                    type: CashRegisterTransactionType.Adjustment,
                    amount: paymentAmount, // Positive amount to reverse the outflow
                    description: $"عكس دفع للمورد - فاتورة #{invoice.InvoiceNumber} - {supplier.Name}",
                    referenceType: "PurchaseInvoicePaymentDeletion",
                    referenceId: paymentId,
                    shiftId: currentShift?.Id
                );
            }
            
            await transaction.CommitAsync();

            return ApiResponse<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error deleting payment {PaymentId} from invoice {InvoiceId}", paymentId, invoiceId);
            return ApiResponse<bool>.Fail(ErrorCodes.INTERNAL_ERROR);
        }
    }

    private async Task<string> GenerateInvoiceNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        var lastInvoice = await _unitOfWork.PurchaseInvoices.Query()
            .Where(pi => pi.TenantId == _currentUserService.TenantId && 
                        pi.InvoiceDate.Year == year)
            .OrderByDescending(pi => pi.Id)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastInvoice != null)
        {
            // Extract number from last invoice (PI-2026-0001 -> 0001)
            var parts = lastInvoice.InvoiceNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
        }

        return $"PI-{year}-{nextNumber:D4}";
    }

    private void CalculateTotals(PurchaseInvoice invoice, Tenant tenant)
    {
        // Subtotal = sum of all items
        invoice.Subtotal = invoice.Items.Sum(i => i.Total);
        
        // Tax = Subtotal * (TaxRate / 100)
        invoice.TaxRate = tenant.IsTaxEnabled ? tenant.TaxRate : 0;
        invoice.TaxAmount = Math.Round(invoice.Subtotal * (invoice.TaxRate / 100), 2);
        
        // Total = Subtotal + Tax
        invoice.Total = invoice.Subtotal + invoice.TaxAmount;
        
        // AmountDue = Total - AmountPaid
        invoice.AmountDue = invoice.Total - invoice.AmountPaid;
    }

    private PurchaseInvoiceDto MapToDto(PurchaseInvoice invoice)
    {
        return new PurchaseInvoiceDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            SupplierId = invoice.SupplierId,
            SupplierName = invoice.SupplierName,
            SupplierPhone = invoice.SupplierPhone,
            InvoiceDate = invoice.InvoiceDate,
            Status = invoice.Status.ToString(),
            Subtotal = invoice.Subtotal,
            TaxRate = invoice.TaxRate,
            TaxAmount = invoice.TaxAmount,
            Total = invoice.Total,
            AmountPaid = invoice.AmountPaid,
            AmountDue = invoice.AmountDue,
            Notes = invoice.Notes,
            CreatedByUserName = invoice.CreatedByUserName ?? string.Empty,
            ConfirmedByUserName = invoice.ConfirmedByUserName,
            ConfirmedAt = invoice.ConfirmedAt,
            CreatedAt = invoice.CreatedAt,
            Items = invoice.Items.Select(i => new PurchaseInvoiceItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                ProductSku = i.ProductSku,
                Quantity = i.Quantity,
                PurchasePrice = i.PurchasePrice,
                Total = i.Total,
                Notes = i.Notes
            }).ToList(),
            Payments = invoice.Payments.Select(p => new PurchaseInvoicePaymentDto
            {
                Id = p.Id,
                Amount = p.Amount,
                PaymentDate = p.PaymentDate,
                Method = p.Method.ToString(),
                ReferenceNumber = p.ReferenceNumber,
                Notes = p.Notes,
                CreatedByUserName = p.CreatedByUserName ?? string.Empty,
                CreatedAt = p.CreatedAt
            }).ToList()
        };
    }
}
