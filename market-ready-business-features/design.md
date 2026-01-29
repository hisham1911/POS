# التصميم التقني - الميزات الجاهزة للسوق

## نظرة عامة

هذا المستند يحتوي على التصميم التقني التفصيلي للميزات السبعة المطلوبة لجعل نظام KasserPro جاهزاً للسوق.

**الميزات**:
1. فواتير الشراء وعلاقة المورد بالمنتج
2. تحسينات إدارة الورديات
3. المخزون الخاص بكل فرع
4. التكامل مع الأجهزة (الطابعات والماسحات)
5. تحديث بيانات الاختبار (Seed Data)
6. الخزينة (Cash Register)
7. المصروفات (Expenses)

**المعمارية**: Clean Architecture + Multi-Tenancy + Tax Exclusive Model

---

## جدول المحتويات

1. [الميزة 1: فواتير الشراء](#الميزة-1-فواتير-الشراء-وعلاقة-المورد-بالمنتج)
2. [الميزة 2: تحسينات الورديات](#الميزة-2-تحسينات-إدارة-الورديات)
3. [الميزة 3: المخزون متعدد الفروع](#الميزة-3-المخزون-الخاص-بكل-فرع)
4. [الميزة 4: التكامل مع الأجهزة](#الميزة-4-التكامل-مع-الأجهزة)
5. [الميزة 5: بيانات الاختبار](#الميزة-5-تحديث-بيانات-الاختبار)
6. [الميزة 6: الخزينة](#الميزة-6-الخزينة-cash-register)
7. [الميزة 7: المصروفات](#الميزة-7-المصروفات-expenses)

---


# الميزة 1: فواتير الشراء وعلاقة المورد بالمنتج

## 1. Database Schema

### 1.1 New Entities

#### PurchaseInvoice Entity

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

public class PurchaseInvoice : BaseEntity
{
    public int TenantId { get; set; }
    public int BranchId { get; set; }
    
    /// <summary>
    /// Auto-generated invoice number (e.g., PI-2026-0001)
    /// </summary>
    public string InvoiceNumber { get; set; } = string.Empty;
    
    public int SupplierId { get; set; }
    
    /// <summary>
    /// Supplier snapshot at invoice time
    /// </summary>
    public string SupplierName { get; set; } = string.Empty;
    public string? SupplierPhone { get; set; }
    public string? SupplierAddress { get; set; }
    
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public PurchaseInvoiceStatus Status { get; set; } = PurchaseInvoiceStatus.Draft;
    
    /// <summary>
    /// Sum of all items (before tax)
    /// </summary>
    public decimal Subtotal { get; set; }
    
    /// <summary>
    /// Tax rate snapshot (from Tenant settings at invoice time)
    /// </summary>
    public decimal TaxRate { get; set; }
    
    /// <summary>
    /// Calculated tax amount (Subtotal * TaxRate / 100)
    /// </summary>
    public decimal TaxAmount { get; set; }
    
    /// <summary>
    /// Total = Subtotal + TaxAmount
    /// </summary>
    public decimal Total { get; set; }
    
    /// <summary>
    /// Sum of all payments
    /// </summary>
    public decimal AmountPaid { get; set; } = 0;
    
    /// <summary>
    /// Remaining amount (Total - AmountPaid)
    /// </summary>
    public decimal AmountDue { get; set; }
    
    public string? Notes { get; set; }
    
    /// <summary>
    /// User who created the invoice
    /// </summary>
    public int CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    
    /// <summary>
    /// User who confirmed the invoice (Admin only)
    /// </summary>
    public int? ConfirmedByUserId { get; set; }
    public string? ConfirmedByUserName { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    
    /// <summary>
    /// Cancellation details
    /// </summary>
    public int? CancelledByUserId { get; set; }
    public string? CancelledByUserName { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    
    /// <summary>
    /// Whether inventory was adjusted when cancelled
    /// </summary>
    public bool InventoryAdjustedOnCancellation { get; set; } = false;
    
    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public Supplier Supplier { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;
    public User? ConfirmedByUser { get; set; }
    public ICollection<PurchaseInvoiceItem> Items { get; set; } = new List<PurchaseInvoiceItem>();
    public ICollection<PurchaseInvoicePayment> Payments { get; set; } = new List<PurchaseInvoicePayment>();
}
```

#### PurchaseInvoiceItem Entity

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class PurchaseInvoiceItem : BaseEntity
{
    public int PurchaseInvoiceId { get; set; }
    public int ProductId { get; set; }
    
    /// <summary>
    /// Product snapshot at invoice time
    /// </summary>
    public string ProductName { get; set; } = string.Empty;
    public string? ProductNameEn { get; set; }
    public string? ProductSku { get; set; }
    public string? ProductBarcode { get; set; }
    
    public int Quantity { get; set; }
    
    /// <summary>
    /// Purchase price per unit (cost price, not selling price)
    /// </summary>
    public decimal PurchasePrice { get; set; }
    
    /// <summary>
    /// Total for this item (Quantity * PurchasePrice)
    /// </summary>
    public decimal Total { get; set; }
    
    public string? Notes { get; set; }
    
    // Navigation
    public PurchaseInvoice PurchaseInvoice { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
```

#### PurchaseInvoicePayment Entity

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

public class PurchaseInvoicePayment : BaseEntity
{
    public int PurchaseInvoiceId { get; set; }
    
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public PaymentMethod Method { get; set; }
    
    /// <summary>
    /// Reference number (check number, transfer ID, etc.)
    /// </summary>
    public string? ReferenceNumber { get; set; }
    
    public string? Notes { get; set; }
    
    public int CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    
    // Navigation
    public PurchaseInvoice PurchaseInvoice { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;
}
```

#### SupplierProduct Entity (Many-to-Many)

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class SupplierProduct : BaseEntity
{
    public int SupplierId { get; set; }
    public int ProductId { get; set; }
    
    /// <summary>
    /// Is this the preferred supplier for this product?
    /// </summary>
    public bool IsPreferred { get; set; } = false;
    
    /// <summary>
    /// Last purchase price from this supplier
    /// </summary>
    public decimal? LastPurchasePrice { get; set; }
    
    /// <summary>
    /// Date of last purchase from this supplier
    /// </summary>
    public DateTime? LastPurchaseDate { get; set; }
    
    /// <summary>
    /// Total quantity purchased from this supplier (lifetime)
    /// </summary>
    public int TotalQuantityPurchased { get; set; } = 0;
    
    /// <summary>
    /// Total amount spent with this supplier (lifetime)
    /// </summary>
    public decimal TotalAmountSpent { get; set; } = 0;
    
    public string? Notes { get; set; }
    
    // Navigation
    public Supplier Supplier { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
```

### 1.2 New Enums

```csharp
namespace KasserPro.Domain.Enums;

public enum PurchaseInvoiceStatus
{
    /// <summary>
    /// Invoice is being created - can be edited/deleted freely
    /// </summary>
    Draft = 0,
    
    /// <summary>
    /// Invoice confirmed by Admin - inventory updated, cannot edit directly
    /// </summary>
    Confirmed = 1,
    
    /// <summary>
    /// Invoice fully paid
    /// </summary>
    Paid = 2,
    
    /// <summary>
    /// Invoice partially paid
    /// </summary>
    PartiallyPaid = 3,
    
    /// <summary>
    /// Invoice cancelled - may or may not adjust inventory
    /// </summary>
    Cancelled = 4,
    
    /// <summary>
    /// Invoice returned (full return)
    /// </summary>
    Returned = 5,
    
    /// <summary>
    /// Invoice partially returned
    /// </summary>
    PartiallyReturned = 6
}
```

### 1.3 Modified Entities

#### Product Entity - Add Cost Tracking

```csharp
// Add to existing Product entity:

/// <summary>
/// Average cost price (updated from purchase invoices)
/// </summary>
public decimal? AverageCost { get; set; }

/// <summary>
/// Last purchase price
/// </summary>
public decimal? LastPurchasePrice { get; set; }

/// <summary>
/// Date of last purchase
/// </summary>
public DateTime? LastPurchaseDate { get; set; }

// Navigation
public ICollection<SupplierProduct> SupplierProducts { get; set; } = new List<SupplierProduct>();
public ICollection<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; } = new List<PurchaseInvoiceItem>();
```

#### Supplier Entity - Add Statistics

```csharp
// Add to existing Supplier entity:

/// <summary>
/// Total amount owed to this supplier
/// </summary>
public decimal TotalDue { get; set; } = 0;

/// <summary>
/// Total amount paid to this supplier (lifetime)
/// </summary>
public decimal TotalPaid { get; set; } = 0;

/// <summary>
/// Total purchases from this supplier (lifetime)
/// </summary>
public decimal TotalPurchases { get; set; } = 0;

/// <summary>
/// Date of last purchase from this supplier
/// </summary>
public DateTime? LastPurchaseDate { get; set; }

// Navigation
public ICollection<SupplierProduct> SupplierProducts { get; set; } = new List<SupplierProduct>();
public ICollection<PurchaseInvoice> PurchaseInvoices { get; set; } = new List<PurchaseInvoice>();
```

### 1.4 Relationships & Indexes

```csharp
// In ApplicationDbContext.OnModelCreating:

// PurchaseInvoice
modelBuilder.Entity<PurchaseInvoice>(entity =>
{
    entity.HasIndex(e => e.InvoiceNumber).IsUnique();
    entity.HasIndex(e => new { e.TenantId, e.BranchId, e.Status });
    entity.HasIndex(e => new { e.TenantId, e.SupplierId });
    entity.HasIndex(e => e.InvoiceDate);
    
    entity.HasOne(e => e.Supplier)
        .WithMany(s => s.PurchaseInvoices)
        .HasForeignKey(e => e.SupplierId)
        .OnDelete(DeleteBehavior.Restrict);
});

// PurchaseInvoiceItem
modelBuilder.Entity<PurchaseInvoiceItem>(entity =>
{
    entity.HasIndex(e => e.PurchaseInvoiceId);
    entity.HasIndex(e => e.ProductId);
    
    entity.HasOne(e => e.Product)
        .WithMany(p => p.PurchaseInvoiceItems)
        .HasForeignKey(e => e.ProductId)
        .OnDelete(DeleteBehavior.Restrict);
});

// SupplierProduct (Many-to-Many)
modelBuilder.Entity<SupplierProduct>(entity =>
{
    entity.HasIndex(e => new { e.SupplierId, e.ProductId }).IsUnique();
    entity.HasIndex(e => new { e.ProductId, e.IsPreferred });
    
    entity.HasOne(e => e.Supplier)
        .WithMany(s => s.SupplierProducts)
        .HasForeignKey(e => e.SupplierId)
        .OnDelete(DeleteBehavior.Cascade);
        
    entity.HasOne(e => e.Product)
        .WithMany(p => p.SupplierProducts)
        .HasForeignKey(e => e.ProductId)
        .OnDelete(DeleteBehavior.Cascade);
});
```

### 1.5 Migration Notes

```bash
# Create migration
dotnet ef migrations add AddPurchaseInvoiceFeature --project src/KasserPro.Infrastructure

# Migration will:
# 1. Create PurchaseInvoice table
# 2. Create PurchaseInvoiceItem table
# 3. Create PurchaseInvoicePayment table
# 4. Create SupplierProduct table (junction)
# 5. Add columns to Product (AverageCost, LastPurchasePrice, LastPurchaseDate)
# 6. Add columns to Supplier (TotalDue, TotalPaid, TotalPurchases, LastPurchaseDate)
# 7. Create indexes for performance
```

---

## 2. API Contracts

### 2.1 Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/purchase-invoices` | Admin | Get all purchase invoices (paginated) |
| GET | `/api/purchase-invoices/{id}` | Admin | Get purchase invoice by ID |
| POST | `/api/purchase-invoices` | Admin | Create new purchase invoice |
| PUT | `/api/purchase-invoices/{id}` | Admin | Update purchase invoice (Draft only) |
| DELETE | `/api/purchase-invoices/{id}` | Admin | Delete purchase invoice (Draft only) |
| POST | `/api/purchase-invoices/{id}/confirm` | Admin | Confirm invoice (update inventory) |
| POST | `/api/purchase-invoices/{id}/cancel` | Admin | Cancel invoice (ask about inventory) |
| POST | `/api/purchase-invoices/{id}/payments` | Admin | Add payment to invoice |
| DELETE | `/api/purchase-invoices/{id}/payments/{paymentId}` | Admin | Delete payment |
| GET | `/api/suppliers/{id}/products` | Admin | Get products for supplier |
| POST | `/api/suppliers/{id}/products` | Admin | Link product to supplier |
| DELETE | `/api/suppliers/{supplierId}/products/{productId}` | Admin | Unlink product from supplier |
| PUT | `/api/suppliers/{supplierId}/products/{productId}/preferred` | Admin | Set as preferred supplier |

### 2.2 Request DTOs

```csharp
namespace KasserPro.Application.DTOs.PurchaseInvoices;

public class CreatePurchaseInvoiceRequest
{
    public int SupplierId { get; set; }
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public List<CreatePurchaseInvoiceItemRequest> Items { get; set; } = new();
    public string? Notes { get; set; }
}

public class CreatePurchaseInvoiceItemRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal PurchasePrice { get; set; }
    public string? Notes { get; set; }
}

public class UpdatePurchaseInvoiceRequest
{
    public int SupplierId { get; set; }
    public DateTime InvoiceDate { get; set; }
    public List<UpdatePurchaseInvoiceItemRequest> Items { get; set; } = new();
    public string? Notes { get; set; }
}

public class UpdatePurchaseInvoiceItemRequest
{
    public int? Id { get; set; } // null = new item
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal PurchasePrice { get; set; }
    public string? Notes { get; set; }
}

public class AddPaymentRequest
{
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public PaymentMethod Method { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
}

public class CancelInvoiceRequest
{
    public string Reason { get; set; } = string.Empty;
    public bool AdjustInventory { get; set; } = false;
}

public class LinkSupplierProductRequest
{
    public int ProductId { get; set; }
    public bool IsPreferred { get; set; } = false;
    public string? Notes { get; set; }
}
```

### 2.3 Response DTOs

```csharp
namespace KasserPro.Application.DTOs.PurchaseInvoices;

public class PurchaseInvoiceDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string? SupplierPhone { get; set; }
    public DateTime InvoiceDate { get; set; }
    public string Status { get; set; } = string.Empty;
    
    public decimal Subtotal { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Total { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal AmountDue { get; set; }
    
    public string? Notes { get; set; }
    
    public string CreatedByUserName { get; set; } = string.Empty;
    public string? ConfirmedByUserName { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public List<PurchaseInvoiceItemDto> Items { get; set; } = new();
    public List<PurchaseInvoicePaymentDto> Payments { get; set; } = new();
}

public class PurchaseInvoiceItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductSku { get; set; }
    public int Quantity { get; set; }
    public decimal PurchasePrice { get; set; }
    public decimal Total { get; set; }
    public string? Notes { get; set; }
}

public class PurchaseInvoicePaymentDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string Method { get; set; } = string.Empty;
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class SupplierProductDto
{
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public bool IsPreferred { get; set; }
    public decimal? LastPurchasePrice { get; set; }
    public DateTime? LastPurchaseDate { get; set; }
    public int TotalQuantityPurchased { get; set; }
    public decimal TotalAmountSpent { get; set; }
}
```


### 2.4 Validation Rules

| Field | Rule | Error Code |
|-------|------|------------|
| SupplierId | Must exist | `SUPPLIER_NOT_FOUND` |
| Items | Must have at least 1 item | `PURCHASE_INVOICE_EMPTY` |
| Quantity | Must be > 0 | `PURCHASE_INVOICE_INVALID_QUANTITY` |
| PurchasePrice | Must be >= 0 | `PURCHASE_INVOICE_INVALID_PRICE` |
| Status | Cannot edit if not Draft | `PURCHASE_INVOICE_NOT_EDITABLE` |
| Status | Cannot delete if not Draft | `PURCHASE_INVOICE_NOT_DELETABLE` |
| Payment.Amount | Must be > 0 | `PAYMENT_INVALID_AMOUNT` |
| Payment.Amount | Cannot exceed AmountDue | `PAYMENT_EXCEEDS_DUE` |

### 2.5 Error Codes (New)

```csharp
namespace KasserPro.Application.Common;

public static partial class ErrorCodes
{
    // Purchase Invoice Errors (5xxx)
    public const string PURCHASE_INVOICE_NOT_FOUND = "PURCHASE_INVOICE_NOT_FOUND";
    public const string PURCHASE_INVOICE_EMPTY = "PURCHASE_INVOICE_EMPTY";
    public const string PURCHASE_INVOICE_INVALID_QUANTITY = "PURCHASE_INVOICE_INVALID_QUANTITY";
    public const string PURCHASE_INVOICE_INVALID_PRICE = "PURCHASE_INVOICE_INVALID_PRICE";
    public const string PURCHASE_INVOICE_NOT_EDITABLE = "PURCHASE_INVOICE_NOT_EDITABLE";
    public const string PURCHASE_INVOICE_NOT_DELETABLE = "PURCHASE_INVOICE_NOT_DELETABLE";
    public const string PURCHASE_INVOICE_ALREADY_CONFIRMED = "PURCHASE_INVOICE_ALREADY_CONFIRMED";
    public const string PURCHASE_INVOICE_ALREADY_CANCELLED = "PURCHASE_INVOICE_ALREADY_CANCELLED";
    public const string PAYMENT_INVALID_AMOUNT = "PAYMENT_INVALID_AMOUNT";
    public const string PAYMENT_EXCEEDS_DUE = "PAYMENT_EXCEEDS_DUE";
    public const string SUPPLIER_PRODUCT_ALREADY_LINKED = "SUPPLIER_PRODUCT_ALREADY_LINKED";
    public const string SUPPLIER_PRODUCT_NOT_FOUND = "SUPPLIER_PRODUCT_NOT_FOUND";
}
```

---

## 3. Business Logic

### 3.1 Service Methods

```csharp
namespace KasserPro.Application.Services;

public interface IPurchaseInvoiceService
{
    // CRUD Operations
    Task<ApiResponse<PaginatedResponse<PurchaseInvoiceDto>>> GetAllAsync(
        int? supplierId = null,
        PurchaseInvoiceStatus? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int pageNumber = 1,
        int pageSize = 20);
    
    Task<ApiResponse<PurchaseInvoiceDto>> GetByIdAsync(int id);
    
    Task<ApiResponse<PurchaseInvoiceDto>> CreateAsync(CreatePurchaseInvoiceRequest request);
    
    Task<ApiResponse<PurchaseInvoiceDto>> UpdateAsync(int id, UpdatePurchaseInvoiceRequest request);
    
    Task<ApiResponse<bool>> DeleteAsync(int id);
    
    // State Transitions
    Task<ApiResponse<PurchaseInvoiceDto>> ConfirmAsync(int id);
    
    Task<ApiResponse<PurchaseInvoiceDto>> CancelAsync(int id, CancelInvoiceRequest request);
    
    // Payments
    Task<ApiResponse<PurchaseInvoicePaymentDto>> AddPaymentAsync(int invoiceId, AddPaymentRequest request);
    
    Task<ApiResponse<bool>> DeletePaymentAsync(int invoiceId, int paymentId);
    
    // Reports
    Task<ApiResponse<AccountsPayableReportDto>> GetAccountsPayableReportAsync(DateTime? asOfDate = null);
    
    Task<ApiResponse<SupplierPurchaseHistoryDto>> GetSupplierPurchaseHistoryAsync(
        int supplierId,
        DateTime? fromDate = null,
        DateTime? toDate = null);
}

public interface ISupplierProductService
{
    Task<ApiResponse<List<SupplierProductDto>>> GetProductsForSupplierAsync(int supplierId);
    
    Task<ApiResponse<List<SupplierProductDto>>> GetSuppliersForProductAsync(int productId);
    
    Task<ApiResponse<SupplierProductDto>> LinkProductToSupplierAsync(
        int supplierId,
        LinkSupplierProductRequest request);
    
    Task<ApiResponse<bool>> UnlinkProductFromSupplierAsync(int supplierId, int productId);
    
    Task<ApiResponse<SupplierProductDto>> SetPreferredSupplierAsync(int supplierId, int productId);
    
    Task<ApiResponse<SupplierPriceComparisonDto>> CompareSupplierPricesAsync(int productId);
}
```

### 3.2 Business Rules

#### Rule 1: Invoice Number Generation
```csharp
// Format: PI-{Year}-{SequentialNumber}
// Example: PI-2026-0001, PI-2026-0002
// Reset sequence each year
private string GenerateInvoiceNumber(int tenantId, int year)
{
    var lastInvoice = await _repository.GetLastInvoiceForYear(tenantId, year);
    var nextNumber = (lastInvoice?.SequenceNumber ?? 0) + 1;
    return $"PI-{year}-{nextNumber:D4}";
}
```

#### Rule 2: Tax Calculation (Tax Exclusive)
```csharp
// Calculate totals using Tax Exclusive model
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
```

#### Rule 3: Status Transitions
```csharp
// Valid status transitions
private bool IsValidStatusTransition(PurchaseInvoiceStatus from, PurchaseInvoiceStatus to)
{
    return (from, to) switch
    {
        (PurchaseInvoiceStatus.Draft, PurchaseInvoiceStatus.Confirmed) => true,
        (PurchaseInvoiceStatus.Draft, PurchaseInvoiceStatus.Cancelled) => true,
        (PurchaseInvoiceStatus.Confirmed, PurchaseInvoiceStatus.PartiallyPaid) => true,
        (PurchaseInvoiceStatus.Confirmed, PurchaseInvoiceStatus.Paid) => true,
        (PurchaseInvoiceStatus.Confirmed, PurchaseInvoiceStatus.Cancelled) => true,
        (PurchaseInvoiceStatus.PartiallyPaid, PurchaseInvoiceStatus.Paid) => true,
        (PurchaseInvoiceStatus.PartiallyPaid, PurchaseInvoiceStatus.Cancelled) => true,
        _ => false
    };
}
```

#### Rule 4: Inventory Update on Confirmation
```csharp
public async Task<ApiResponse<PurchaseInvoiceDto>> ConfirmAsync(int id)
{
    await using var transaction = await _unitOfWork.BeginTransactionAsync();
    try
    {
        var invoice = await _repository.GetByIdAsync(id);
        
        // Validate
        if (invoice.Status != PurchaseInvoiceStatus.Draft)
            return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.PURCHASE_INVOICE_NOT_EDITABLE);
        
        // Update inventory for each item
        foreach (var item in invoice.Items)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId);
            
            if (product.TrackInventory)
            {
                product.StockQuantity = (product.StockQuantity ?? 0) + item.Quantity;
                product.LastStockUpdate = DateTime.UtcNow;
            }
            
            // Update cost tracking
            product.LastPurchasePrice = item.PurchasePrice;
            product.LastPurchaseDate = invoice.InvoiceDate;
            
            // Update average cost (weighted average)
            if (product.AverageCost.HasValue)
            {
                var totalCost = (product.AverageCost.Value * (product.StockQuantity ?? 0)) + 
                               (item.PurchasePrice * item.Quantity);
                product.AverageCost = totalCost / (product.StockQuantity ?? 1);
            }
            else
            {
                product.AverageCost = item.PurchasePrice;
            }
            
            await _productRepository.UpdateAsync(product);
            
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
                Notes = $"Purchase Invoice {invoice.InvoiceNumber}",
                UserId = _currentUserService.UserId
            };
            await _stockMovementRepository.CreateAsync(movement);
            
            // Update SupplierProduct
            var supplierProduct = await _supplierProductRepository
                .GetBySupplierAndProductAsync(invoice.SupplierId, item.ProductId);
            
            if (supplierProduct != null)
            {
                supplierProduct.LastPurchasePrice = item.PurchasePrice;
                supplierProduct.LastPurchaseDate = invoice.InvoiceDate;
                supplierProduct.TotalQuantityPurchased += item.Quantity;
                supplierProduct.TotalAmountSpent += item.Total;
                await _supplierProductRepository.UpdateAsync(supplierProduct);
            }
        }
        
        // Update invoice status
        invoice.Status = PurchaseInvoiceStatus.Confirmed;
        invoice.ConfirmedByUserId = _currentUserService.UserId;
        invoice.ConfirmedByUserName = _currentUserService.UserName;
        invoice.ConfirmedAt = DateTime.UtcNow;
        
        await _repository.UpdateAsync(invoice);
        
        // Update supplier totals
        var supplier = await _supplierRepository.GetByIdAsync(invoice.SupplierId);
        supplier.TotalPurchases += invoice.Total;
        supplier.TotalDue += invoice.AmountDue;
        supplier.LastPurchaseDate = invoice.InvoiceDate;
        await _supplierRepository.UpdateAsync(supplier);
        
        await transaction.CommitAsync();
        
        return ApiResponse<PurchaseInvoiceDto>.Success(_mapper.Map<PurchaseInvoiceDto>(invoice));
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

#### Rule 5: Cancellation with Inventory Adjustment
```csharp
public async Task<ApiResponse<PurchaseInvoiceDto>> CancelAsync(int id, CancelInvoiceRequest request)
{
    await using var transaction = await _unitOfWork.BeginTransactionAsync();
    try
    {
        var invoice = await _repository.GetByIdAsync(id);
        
        // Validate
        if (invoice.Status == PurchaseInvoiceStatus.Cancelled)
            return ApiResponse<PurchaseInvoiceDto>.Fail(ErrorCodes.PURCHASE_INVOICE_ALREADY_CANCELLED);
        
        // If confirmed and user wants to adjust inventory
        if (invoice.Status == PurchaseInvoiceStatus.Confirmed && request.AdjustInventory)
        {
            foreach (var item in invoice.Items)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId);
                
                if (product.TrackInventory)
                {
                    product.StockQuantity = (product.StockQuantity ?? 0) - item.Quantity;
                    product.LastStockUpdate = DateTime.UtcNow;
                    await _productRepository.UpdateAsync(product);
                    
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
                        Notes = $"Cancelled Purchase Invoice {invoice.InvoiceNumber}: {request.Reason}",
                        UserId = _currentUserService.UserId
                    };
                    await _stockMovementRepository.CreateAsync(movement);
                }
            }
            
            invoice.InventoryAdjustedOnCancellation = true;
        }
        
        // Update invoice
        invoice.Status = PurchaseInvoiceStatus.Cancelled;
        invoice.CancelledByUserId = _currentUserService.UserId;
        invoice.CancelledByUserName = _currentUserService.UserName;
        invoice.CancelledAt = DateTime.UtcNow;
        invoice.CancellationReason = request.Reason;
        
        await _repository.UpdateAsync(invoice);
        
        // Update supplier totals
        var supplier = await _supplierRepository.GetByIdAsync(invoice.SupplierId);
        supplier.TotalDue -= invoice.AmountDue;
        await _supplierRepository.UpdateAsync(supplier);
        
        await transaction.CommitAsync();
        
        return ApiResponse<PurchaseInvoiceDto>.Success(_mapper.Map<PurchaseInvoiceDto>(invoice));
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```


#### Rule 6: Payment Processing
```csharp
public async Task<ApiResponse<PurchaseInvoicePaymentDto>> AddPaymentAsync(
    int invoiceId, 
    AddPaymentRequest request)
{
    await using var transaction = await _unitOfWork.BeginTransactionAsync();
    try
    {
        var invoice = await _repository.GetByIdAsync(invoiceId);
        
        // Validate
        if (request.Amount <= 0)
            return ApiResponse<PurchaseInvoicePaymentDto>.Fail(ErrorCodes.PAYMENT_INVALID_AMOUNT);
        
        if (request.Amount > invoice.AmountDue)
            return ApiResponse<PurchaseInvoicePaymentDto>.Fail(ErrorCodes.PAYMENT_EXCEEDS_DUE);
        
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
            CreatedByUserName = _currentUserService.UserName
        };
        
        await _paymentRepository.CreateAsync(payment);
        
        // Update invoice
        invoice.AmountPaid += request.Amount;
        invoice.AmountDue -= request.Amount;
        
        // Update status
        if (invoice.AmountDue == 0)
            invoice.Status = PurchaseInvoiceStatus.Paid;
        else if (invoice.AmountPaid > 0)
            invoice.Status = PurchaseInvoiceStatus.PartiallyPaid;
        
        await _repository.UpdateAsync(invoice);
        
        // Update supplier
        var supplier = await _supplierRepository.GetByIdAsync(invoice.SupplierId);
        supplier.TotalPaid += request.Amount;
        supplier.TotalDue -= request.Amount;
        await _supplierRepository.UpdateAsync(supplier);
        
        await transaction.CommitAsync();
        
        return ApiResponse<PurchaseInvoicePaymentDto>.Success(
            _mapper.Map<PurchaseInvoicePaymentDto>(payment));
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

### 3.3 Transaction Boundaries

All operations that modify inventory or financial data MUST be in transactions:
- `ConfirmAsync` - Updates inventory + invoice + supplier
- `CancelAsync` - May update inventory + invoice + supplier
- `AddPaymentAsync` - Updates invoice + supplier
- `DeletePaymentAsync` - Updates invoice + supplier

### 3.4 Audit Trail Points

Log these operations in AuditLog:
- Create purchase invoice
- Update purchase invoice
- Delete purchase invoice
- Confirm purchase invoice
- Cancel purchase invoice (with reason)
- Add payment
- Delete payment
- Link supplier to product
- Set preferred supplier

---

## 4. Frontend Types

### 4.1 TypeScript Interfaces

```typescript
// client/src/types/purchaseInvoice.ts

export type PurchaseInvoiceStatus = 
  | 'Draft' 
  | 'Confirmed' 
  | 'Paid' 
  | 'PartiallyPaid' 
  | 'Cancelled' 
  | 'Returned' 
  | 'PartiallyReturned';

export interface PurchaseInvoice {
  id: number;
  invoiceNumber: string;
  supplierId: number;
  supplierName: string;
  supplierPhone?: string;
  invoiceDate: string;
  status: PurchaseInvoiceStatus;
  
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  
  notes?: string;
  
  createdByUserName: string;
  confirmedByUserName?: string;
  confirmedAt?: string;
  
  createdAt: string;
  
  items: PurchaseInvoiceItem[];
  payments: PurchaseInvoicePayment[];
}

export interface PurchaseInvoiceItem {
  id: number;
  productId: number;
  productName: string;
  productSku?: string;
  quantity: number;
  purchasePrice: number;
  total: number;
  notes?: string;
}

export interface PurchaseInvoicePayment {
  id: number;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdByUserName: string;
  createdAt: string;
}

export interface CreatePurchaseInvoiceRequest {
  supplierId: number;
  invoiceDate: string;
  items: CreatePurchaseInvoiceItemRequest[];
  notes?: string;
}

export interface CreatePurchaseInvoiceItemRequest {
  productId: number;
  quantity: number;
  purchasePrice: number;
  notes?: string;
}

export interface AddPaymentRequest {
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface CancelInvoiceRequest {
  reason: string;
  adjustInventory: boolean;
}

export interface SupplierProduct {
  supplierId: number;
  supplierName: string;
  productId: number;
  productName: string;
  isPreferred: boolean;
  lastPurchasePrice?: number;
  lastPurchaseDate?: string;
  totalQuantityPurchased: number;
  totalAmountSpent: number;
}
```

### 4.2 RTK Query API

```typescript
// client/src/api/purchaseInvoiceApi.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';
import type { 
  PurchaseInvoice, 
  CreatePurchaseInvoiceRequest,
  AddPaymentRequest,
  CancelInvoiceRequest 
} from '../types/purchaseInvoice';
import type { ApiResponse, PaginatedResponse } from '../types/api';

export const purchaseInvoiceApi = createApi({
  reducerPath: 'purchaseInvoiceApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['PurchaseInvoice', 'SupplierProduct'],
  endpoints: (builder) => ({
    getPurchaseInvoices: builder.query<
      ApiResponse<PaginatedResponse<PurchaseInvoice>>,
      {
        supplierId?: number;
        status?: string;
        fromDate?: string;
        toDate?: string;
        pageNumber?: number;
        pageSize?: number;
      }
    >({
      query: (params) => ({
        url: '/purchase-invoices',
        params,
      }),
      providesTags: ['PurchaseInvoice'],
    }),
    
    getPurchaseInvoiceById: builder.query<ApiResponse<PurchaseInvoice>, number>({
      query: (id) => `/purchase-invoices/${id}`,
      providesTags: (result, error, id) => [{ type: 'PurchaseInvoice', id }],
    }),
    
    createPurchaseInvoice: builder.mutation<
      ApiResponse<PurchaseInvoice>,
      CreatePurchaseInvoiceRequest
    >({
      query: (data) => ({
        url: '/purchase-invoices',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PurchaseInvoice'],
    }),
    
    confirmPurchaseInvoice: builder.mutation<ApiResponse<PurchaseInvoice>, number>({
      query: (id) => ({
        url: `/purchase-invoices/${id}/confirm`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'PurchaseInvoice', id },
        'PurchaseInvoice',
      ],
    }),
    
    cancelPurchaseInvoice: builder.mutation<
      ApiResponse<PurchaseInvoice>,
      { id: number; request: CancelInvoiceRequest }
    >({
      query: ({ id, request }) => ({
        url: `/purchase-invoices/${id}/cancel`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PurchaseInvoice', id },
        'PurchaseInvoice',
      ],
    }),
    
    addPayment: builder.mutation<
      ApiResponse<PurchaseInvoicePayment>,
      { invoiceId: number; request: AddPaymentRequest }
    >({
      query: ({ invoiceId, request }) => ({
        url: `/purchase-invoices/${invoiceId}/payments`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: 'PurchaseInvoice', id: invoiceId },
      ],
    }),
  }),
});

export const {
  useGetPurchaseInvoicesQuery,
  useGetPurchaseInvoiceByIdQuery,
  useCreatePurchaseInvoiceMutation,
  useConfirmPurchaseInvoiceMutation,
  useCancelPurchaseInvoiceMutation,
  useAddPaymentMutation,
} = purchaseInvoiceApi;
```

### 4.3 State Management

No additional Redux slices needed - RTK Query handles all state.

---

## 5. Testing Strategy

### 5.1 Unit Tests

```csharp
// Test scenarios for PurchaseInvoiceService

[Fact]
public async Task CalculateTotals_TaxExclusive_CalculatesCorrectly()
{
    // Arrange
    var invoice = new PurchaseInvoice
    {
        Items = new List<PurchaseInvoiceItem>
        {
            new() { Quantity = 10, PurchasePrice = 100, Total = 1000 },
            new() { Quantity = 5, PurchasePrice = 50, Total = 250 }
        }
    };
    var tenant = new Tenant { TaxRate = 14, IsTaxEnabled = true };
    
    // Act
    CalculateTotals(invoice, tenant);
    
    // Assert
    Assert.Equal(1250, invoice.Subtotal);
    Assert.Equal(14, invoice.TaxRate);
    Assert.Equal(175, invoice.TaxAmount); // 1250 * 0.14
    Assert.Equal(1425, invoice.Total); // 1250 + 175
}

[Fact]
public async Task ConfirmAsync_UpdatesInventoryCorrectly()
{
    // Test that confirming invoice increases stock
}

[Fact]
public async Task CancelAsync_WithAdjustInventory_DecreasesStock()
{
    // Test that cancelling with adjustment decreases stock
}

[Fact]
public async Task AddPaymentAsync_UpdatesStatusCorrectly()
{
    // Test status transitions: Confirmed -> PartiallyPaid -> Paid
}
```

### 5.2 Integration Tests

```csharp
// Test scenarios for PurchaseInvoice API

[Fact]
public async Task CreatePurchaseInvoice_ValidData_ReturnsSuccess()
{
    // Test full flow: create -> confirm -> add payment
}

[Fact]
public async Task ConfirmPurchaseInvoice_UpdatesInventoryAndSupplier()
{
    // Test that inventory and supplier totals are updated
}

[Fact]
public async Task CancelPurchaseInvoice_WithInventoryAdjustment_RevertsStock()
{
    // Test cancellation with inventory adjustment
}
```

### 5.3 E2E Tests

```typescript
// client/e2e/purchase-invoice.spec.ts

test.describe('Purchase Invoice Flow', () => {
  test('Admin can create and confirm purchase invoice', async ({ page }) => {
    // 1. Login as Admin
    // 2. Navigate to Purchase Invoices
    // 3. Create new invoice
    // 4. Add items
    // 5. Save as Draft
    // 6. Confirm invoice
    // 7. Verify inventory updated
    // 8. Add payment
    // 9. Verify status changed to Paid
  });
  
  test('Admin can cancel invoice with inventory adjustment', async ({ page }) => {
    // 1. Create and confirm invoice
    // 2. Cancel with "Adjust Inventory" = true
    // 3. Verify inventory decreased
    // 4. Verify status = Cancelled
  });
});
```

---


# الميزة 2: تحسينات إدارة الورديات

## 1. Database Schema

### 1.1 Modified Entities

#### Shift Entity - Add New Fields

```csharp
// Add to existing Shift entity:

/// <summary>
/// Last activity timestamp (updated on every order)
/// </summary>
public DateTime LastActivityAt { get; set; } = DateTime.UtcNow;

/// <summary>
/// Inactivity warning shown at this time
/// </summary>
public DateTime? InactivityWarningAt { get; set; }

/// <summary>
/// Force close details
/// </summary>
public bool IsForceClose { get; set; } = false;
public int? ForceClosedByUserId { get; set; }
public string? ForceClosedByUserName { get; set; }
public DateTime? ForceClosedAt { get; set; }
public string? ForceCloseReason { get; set; }

/// <summary>
/// Handover tracking
/// </summary>
public int? HandedOverFromUserId { get; set; }
public string? HandedOverFromUserName { get; set; }
public DateTime? HandedOverAt { get; set; }

// Navigation
public User? ForceClosedByUser { get; set; }
public ICollection<ShiftHandover> Handovers { get; set; } = new List<ShiftHandover>();
```

### 1.2 New Entities

#### ShiftHandover Entity

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class ShiftHandover : BaseEntity
{
    public int ShiftId { get; set; }
    public int TenantId { get; set; }
    public int BranchId { get; set; }
    
    /// <summary>
    /// User handing over the shift
    /// </summary>
    public int FromUserId { get; set; }
    public string FromUserName { get; set; } = string.Empty;
    
    /// <summary>
    /// User receiving the shift
    /// </summary>
    public int ToUserId { get; set; }
    public string ToUserName { get; set; } = string.Empty;
    
    public DateTime HandoverTime { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Cash balance at handover time
    /// </summary>
    public decimal CashBalance { get; set; }
    
    /// <summary>
    /// Number of orders at handover time
    /// </summary>
    public int OrderCount { get; set; }
    
    /// <summary>
    /// Total sales at handover time
    /// </summary>
    public decimal TotalSales { get; set; }
    
    /// <summary>
    /// Issues or notes from outgoing cashier
    /// </summary>
    public string? Issues { get; set; }
    
    /// <summary>
    /// General notes
    /// </summary>
    public string? Notes { get; set; }
    
    /// <summary>
    /// Acknowledgment from receiving cashier
    /// </summary>
    public bool Acknowledged { get; set; } = false;
    public DateTime? AcknowledgedAt { get; set; }
    
    // Navigation
    public Shift Shift { get; set; } = null!;
    public Tenant Tenant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public User FromUser { get; set; } = null!;
    public User ToUser { get; set; } = null!;
}
```

### 1.3 Relationships & Indexes

```csharp
// In ApplicationDbContext.OnModelCreating:

// Shift - add indexes for new fields
modelBuilder.Entity<Shift>(entity =>
{
    entity.HasIndex(e => e.LastActivityAt);
    entity.HasIndex(e => new { e.TenantId, e.BranchId, e.IsClosed });
    entity.HasIndex(e => new { e.UserId, e.IsClosed });
    
    entity.HasOne(e => e.ForceClosedByUser)
        .WithMany()
        .HasForeignKey(e => e.ForceClosedByUserId)
        .OnDelete(DeleteBehavior.Restrict);
});

// ShiftHandover
modelBuilder.Entity<ShiftHandover>(entity =>
{
    entity.HasIndex(e => e.ShiftId);
    entity.HasIndex(e => new { e.FromUserId, e.HandoverTime });
    entity.HasIndex(e => new { e.ToUserId, e.HandoverTime });
    
    entity.HasOne(e => e.Shift)
        .WithMany(s => s.Handovers)
        .HasForeignKey(e => e.ShiftId)
        .OnDelete(DeleteBehavior.Cascade);
        
    entity.HasOne(e => e.FromUser)
        .WithMany()
        .HasForeignKey(e => e.FromUserId)
        .OnDelete(DeleteBehavior.Restrict);
        
    entity.HasOne(e => e.ToUser)
        .WithMany()
        .HasForeignKey(e => e.ToUserId)
        .OnDelete(DeleteBehavior.Restrict);
});
```

### 1.4 Migration Notes

```bash
# Create migration
dotnet ef migrations add AddShiftImprovements --project src/KasserPro.Infrastructure

# Migration will:
# 1. Add columns to Shift table (LastActivityAt, InactivityWarningAt, IsForceClose, etc.)
# 2. Create ShiftHandover table
# 3. Create indexes for performance
# 4. Set default values for existing shifts
```

---

## 2. API Contracts

### 2.1 Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/shifts/current` | Cashier, Admin | Get current open shift |
| GET | `/api/shifts/all-open` | Admin | Get all open shifts in branch |
| POST | `/api/shifts/open` | Cashier, Admin | Open new shift |
| POST | `/api/shifts/close` | Cashier, Admin | Close current shift |
| POST | `/api/shifts/{id}/force-close` | Admin | Force close any shift |
| POST | `/api/shifts/{id}/handover` | Cashier, Admin | Handover shift to another user |
| POST | `/api/shifts/{id}/acknowledge-handover` | Cashier, Admin | Acknowledge received shift |
| PUT | `/api/shifts/{id}/update-activity` | Cashier, Admin | Update last activity (internal) |
| GET | `/api/shifts/{id}/report` | Cashier, Admin | Get detailed shift report |

### 2.2 Request DTOs

```csharp
namespace KasserPro.Application.DTOs.Shifts;

public class ForceCloseShiftRequest
{
    public string Reason { get; set; } = string.Empty;
    public decimal ClosingBalance { get; set; }
    public string? Notes { get; set; }
}

public class HandoverShiftRequest
{
    public int ToUserId { get; set; }
    public string? Issues { get; set; }
    public string? Notes { get; set; }
}

public class AcknowledgeHandoverRequest
{
    public int HandoverId { get; set; }
}
```

### 2.3 Response DTOs

```csharp
namespace KasserPro.Application.DTOs.Shifts;

public class ShiftDto
{
    // Existing fields...
    
    // New fields
    public DateTime LastActivityAt { get; set; }
    public DateTime? InactivityWarningAt { get; set; }
    public bool IsForceClose { get; set; }
    public string? ForceClosedByUserName { get; set; }
    public DateTime? ForceClosedAt { get; set; }
    public string? ForceCloseReason { get; set; }
    
    public List<ShiftHandoverDto> Handovers { get; set; } = new();
}

public class ShiftHandoverDto
{
    public int Id { get; set; }
    public int ShiftId { get; set; }
    public string FromUserName { get; set; } = string.Empty;
    public string ToUserName { get; set; } = string.Empty;
    public DateTime HandoverTime { get; set; }
    public decimal CashBalance { get; set; }
    public int OrderCount { get; set; }
    public decimal TotalSales { get; set; }
    public string? Issues { get; set; }
    public string? Notes { get; set; }
    public bool Acknowledged { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
}

public class ShiftReportDto
{
    public int ShiftId { get; set; }
    public string ShiftNumber { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string BranchName { get; set; } = string.Empty;
    
    // Timing
    public DateTime OpenedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public TimeSpan Duration { get; set; }
    public string DurationFormatted { get; set; } = string.Empty; // "8 hours 30 minutes"
    
    // Financial
    public decimal OpeningBalance { get; set; }
    public decimal ClosingBalance { get; set; }
    public decimal ExpectedBalance { get; set; }
    public decimal Difference { get; set; }
    public decimal TotalCash { get; set; }
    public decimal TotalCard { get; set; }
    public decimal TotalSales { get; set; }
    
    // Orders
    public int TotalOrders { get; set; }
    public int CompletedOrders { get; set; }
    public int CancelledOrders { get; set; }
    public decimal AverageOrderValue { get; set; }
    
    // Breakdown
    public List<OrderSummaryDto> Orders { get; set; } = new();
    public List<PaymentBreakdownDto> PaymentBreakdown { get; set; } = new();
    public List<HourlySalesDto> HourlySales { get; set; } = new();
    
    // Handovers
    public List<ShiftHandoverDto> Handovers { get; set; } = new();
    
    // Force Close
    public bool IsForceClose { get; set; }
    public string? ForceCloseReason { get; set; }
    
    public string? Notes { get; set; }
}

public class PaymentBreakdownDto
{
    public string Method { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Amount { get; set; }
}

public class HourlySalesDto
{
    public int Hour { get; set; }
    public int OrderCount { get; set; }
    public decimal Sales { get; set; }
}
```

### 2.4 Validation Rules

| Field | Rule | Error Code |
|-------|------|------------|
| ForceCloseReason | Required | `SHIFT_FORCE_CLOSE_REASON_REQUIRED` |
| ToUserId | Must exist and be different | `SHIFT_HANDOVER_INVALID_USER` |
| ToUserId | Cannot have open shift | `SHIFT_USER_HAS_OPEN_SHIFT` |

### 2.5 Error Codes (New)

```csharp
public static partial class ErrorCodes
{
    // Shift Errors (6xxx)
    public const string SHIFT_FORCE_CLOSE_REASON_REQUIRED = "SHIFT_FORCE_CLOSE_REASON_REQUIRED";
    public const string SHIFT_FORCE_CLOSE_UNAUTHORIZED = "SHIFT_FORCE_CLOSE_UNAUTHORIZED";
    public const string SHIFT_HANDOVER_INVALID_USER = "SHIFT_HANDOVER_INVALID_USER";
    public const string SHIFT_USER_HAS_OPEN_SHIFT = "SHIFT_USER_HAS_OPEN_SHIFT";
    public const string SHIFT_HANDOVER_NOT_FOUND = "SHIFT_HANDOVER_NOT_FOUND";
    public const string SHIFT_INACTIVITY_WARNING = "SHIFT_INACTIVITY_WARNING";
}
```

---

## 3. Business Logic

### 3.1 Service Methods

```csharp
namespace KasserPro.Application.Services;

public interface IShiftService
{
    // Existing methods...
    
    // New methods
    Task<ApiResponse<List<ShiftDto>>> GetAllOpenShiftsAsync();
    
    Task<ApiResponse<ShiftDto>> ForceCloseAsync(int shiftId, ForceCloseShiftRequest request);
    
    Task<ApiResponse<ShiftHandoverDto>> HandoverShiftAsync(int shiftId, HandoverShiftRequest request);
    
    Task<ApiResponse<bool>> AcknowledgeHandoverAsync(int shiftId, AcknowledgeHandoverRequest request);
    
    Task<ApiResponse<bool>> UpdateActivityAsync(int shiftId);
    
    Task<ApiResponse<ShiftReportDto>> GetShiftReportAsync(int shiftId);
    
    Task<ApiResponse<List<ShiftDto>>> GetInactiveShiftsAsync(int hoursThreshold = 12);
}
```


### 3.2 Business Rules

#### Rule 1: Force Close (Admin Only)

```csharp
public async Task<ApiResponse<ShiftDto>> ForceCloseAsync(int shiftId, ForceCloseShiftRequest request)
{
    // Validate: Only Admin can force close
    if (_currentUserService.Role != UserRole.Admin)
        return ApiResponse<ShiftDto>.Fail(ErrorCodes.SHIFT_FORCE_CLOSE_UNAUTHORIZED);
    
    // Validate: Reason is required
    if (string.IsNullOrWhiteSpace(request.Reason))
        return ApiResponse<ShiftDto>.Fail(ErrorCodes.SHIFT_FORCE_CLOSE_REASON_REQUIRED);
    
    await using var transaction = await _unitOfWork.BeginTransactionAsync();
    try
    {
        var shift = await _repository.GetByIdAsync(shiftId);
        
        if (shift.IsClosed)
            return ApiResponse<ShiftDto>.Fail(ErrorCodes.SHIFT_ALREADY_CLOSED);
        
        // Close the shift
        shift.IsClosed = true;
        shift.ClosedAt = DateTime.UtcNow;
        shift.ClosingBalance = request.ClosingBalance;
        shift.Difference = shift.ClosingBalance - shift.ExpectedBalance;
        shift.Notes = request.Notes;
        
        // Mark as force close
        shift.IsForceClose = true;
        shift.ForceClosedByUserId = _currentUserService.UserId;
        shift.ForceClosedByUserName = _currentUserService.UserName;
        shift.ForceClosedAt = DateTime.UtcNow;
        shift.ForceCloseReason = request.Reason;
        
        await _repository.UpdateAsync(shift);
        await transaction.CommitAsync();
        
        // TODO: Send notification to shift owner
        await _notificationService.NotifyShiftForceClosedAsync(shift);
        
        return ApiResponse<ShiftDto>.Success(_mapper.Map<ShiftDto>(shift));
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

#### Rule 2: Shift Handover

```csharp
public async Task<ApiResponse<ShiftHandoverDto>> HandoverShiftAsync(
    int shiftId, 
    HandoverShiftRequest request)
{
    await using var transaction = await _unitOfWork.BeginTransactionAsync();
    try
    {
        var shift = await _repository.GetByIdAsync(shiftId);
        
        // Validate: Shift must be open
        if (shift.IsClosed)
            return ApiResponse<ShiftHandoverDto>.Fail(ErrorCodes.SHIFT_ALREADY_CLOSED);
        
        // Validate: Can only handover own shift (unless Admin)
        if (shift.UserId != _currentUserService.UserId && 
            _currentUserService.Role != UserRole.Admin)
            return ApiResponse<ShiftHandoverDto>.Fail(ErrorCodes.UNAUTHORIZED);
        
        // Validate: ToUser must exist
        var toUser = await _userRepository.GetByIdAsync(request.ToUserId);
        if (toUser == null)
            return ApiResponse<ShiftHandoverDto>.Fail(ErrorCodes.USER_NOT_FOUND);
        
        // Validate: ToUser cannot be same as FromUser
        if (request.ToUserId == shift.UserId)
            return ApiResponse<ShiftHandoverDto>.Fail(ErrorCodes.SHIFT_HANDOVER_INVALID_USER);
        
        // Validate: ToUser cannot have open shift
        var existingShift = await _repository.GetOpenShiftForUserAsync(
            request.ToUserId, 
            shift.BranchId);
        if (existingShift != null)
            return ApiResponse<ShiftHandoverDto>.Fail(ErrorCodes.SHIFT_USER_HAS_OPEN_SHIFT);
        
        // Create handover record
        var handover = new ShiftHandover
        {
            ShiftId = shiftId,
            TenantId = shift.TenantId,
            BranchId = shift.BranchId,
            FromUserId = shift.UserId,
            FromUserName = shift.User.Name,
            ToUserId = request.ToUserId,
            ToUserName = toUser.Name,
            HandoverTime = DateTime.UtcNow,
            CashBalance = shift.OpeningBalance + shift.TotalCash,
            OrderCount = shift.TotalOrders,
            TotalSales = shift.TotalCash + shift.TotalCard,
            Issues = request.Issues,
            Notes = request.Notes,
            Acknowledged = false
        };
        
        await _handoverRepository.CreateAsync(handover);
        
        // Update shift ownership
        shift.HandedOverFromUserId = shift.UserId;
        shift.HandedOverFromUserName = shift.User.Name;
        shift.HandedOverAt = DateTime.UtcNow;
        shift.UserId = request.ToUserId;
        shift.LastActivityAt = DateTime.UtcNow;
        
        await _repository.UpdateAsync(shift);
        await transaction.CommitAsync();
        
        // TODO: Send notification to new user
        await _notificationService.NotifyShiftHandoverAsync(shift, handover);
        
        return ApiResponse<ShiftHandoverDto>.Success(_mapper.Map<ShiftHandoverDto>(handover));
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

#### Rule 3: Activity Tracking

```csharp
// Update LastActivityAt on every order
public async Task UpdateActivityAsync(int shiftId)
{
    var shift = await _repository.GetByIdAsync(shiftId);
    if (shift != null && !shift.IsClosed)
    {
        shift.LastActivityAt = DateTime.UtcNow;
        await _repository.UpdateAsync(shift);
    }
}

// Check for inactive shifts (background job)
public async Task<List<Shift>> GetInactiveShiftsAsync(int hoursThreshold = 12)
{
    var cutoffTime = DateTime.UtcNow.AddHours(-hoursThreshold);
    return await _repository.GetShiftsInactiveSinceAsync(cutoffTime);
}
```

#### Rule 4: Shift Report Generation

```csharp
public async Task<ApiResponse<ShiftReportDto>> GetShiftReportAsync(int shiftId)
{
    var shift = await _repository.GetByIdWithDetailsAsync(shiftId);
    
    if (shift == null)
        return ApiResponse<ShiftReportDto>.Fail(ErrorCodes.SHIFT_NOT_FOUND);
    
    // Calculate duration
    var duration = (shift.ClosedAt ?? DateTime.UtcNow) - shift.OpenedAt;
    
    // Get orders breakdown
    var orders = shift.Orders.Select(o => new OrderSummaryDto
    {
        OrderNumber = o.OrderNumber,
        Total = o.Total,
        Status = o.Status.ToString(),
        CompletedAt = o.CompletedAt,
        CustomerName = o.CustomerName
    }).ToList();
    
    // Payment breakdown
    var paymentBreakdown = shift.Orders
        .SelectMany(o => o.Payments)
        .GroupBy(p => p.Method)
        .Select(g => new PaymentBreakdownDto
        {
            Method = g.Key.ToString(),
            Count = g.Count(),
            Amount = g.Sum(p => p.Amount)
        })
        .ToList();
    
    // Hourly sales
    var hourlySales = shift.Orders
        .Where(o => o.CompletedAt.HasValue)
        .GroupBy(o => o.CompletedAt!.Value.Hour)
        .Select(g => new HourlySalesDto
        {
            Hour = g.Key,
            OrderCount = g.Count(),
            Sales = g.Sum(o => o.Total)
        })
        .OrderBy(h => h.Hour)
        .ToList();
    
    var report = new ShiftReportDto
    {
        ShiftId = shift.Id,
        ShiftNumber = $"SH-{shift.Id:D6}",
        UserName = shift.User.Name,
        BranchName = shift.Branch.Name,
        OpenedAt = shift.OpenedAt,
        ClosedAt = shift.ClosedAt,
        Duration = duration,
        DurationFormatted = FormatDuration(duration),
        OpeningBalance = shift.OpeningBalance,
        ClosingBalance = shift.ClosingBalance,
        ExpectedBalance = shift.ExpectedBalance,
        Difference = shift.Difference,
        TotalCash = shift.TotalCash,
        TotalCard = shift.TotalCard,
        TotalSales = shift.TotalCash + shift.TotalCard,
        TotalOrders = shift.TotalOrders,
        CompletedOrders = shift.Orders.Count(o => o.Status == OrderStatus.Completed),
        CancelledOrders = shift.Orders.Count(o => o.Status == OrderStatus.Cancelled),
        AverageOrderValue = shift.TotalOrders > 0 ? 
            (shift.TotalCash + shift.TotalCard) / shift.TotalOrders : 0,
        Orders = orders,
        PaymentBreakdown = paymentBreakdown,
        HourlySales = hourlySales,
        Handovers = _mapper.Map<List<ShiftHandoverDto>>(shift.Handovers),
        IsForceClose = shift.IsForceClose,
        ForceCloseReason = shift.ForceCloseReason,
        Notes = shift.Notes
    };
    
    return ApiResponse<ShiftReportDto>.Success(report);
}

private string FormatDuration(TimeSpan duration)
{
    var hours = (int)duration.TotalHours;
    var minutes = duration.Minutes;
    return $"{hours} ساعة {minutes} دقيقة";
}
```

### 3.3 Transaction Boundaries

- `ForceCloseAsync` - Updates shift + creates audit log
- `HandoverShiftAsync` - Creates handover + updates shift
- `AcknowledgeHandoverAsync` - Updates handover record

### 3.4 Audit Trail Points

Log these operations:
- Force close shift (with reason)
- Handover shift (from/to users)
- Acknowledge handover

---

## 4. Frontend Types

### 4.1 TypeScript Interfaces

```typescript
// client/src/types/shift.ts

export interface Shift {
  // Existing fields...
  
  // New fields
  lastActivityAt: string;
  inactivityWarningAt?: string;
  isForceClose: boolean;
  forceClosedByUserName?: string;
  forceClosedAt?: string;
  forceCloseReason?: string;
  handovers: ShiftHandover[];
}

export interface ShiftHandover {
  id: number;
  shiftId: number;
  fromUserName: string;
  toUserName: string;
  handoverTime: string;
  cashBalance: number;
  orderCount: number;
  totalSales: number;
  issues?: string;
  notes?: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface ForceCloseShiftRequest {
  reason: string;
  closingBalance: number;
  notes?: string;
}

export interface HandoverShiftRequest {
  toUserId: number;
  issues?: string;
  notes?: string;
}

export interface ShiftReport {
  shiftId: number;
  shiftNumber: string;
  userName: string;
  branchName: string;
  openedAt: string;
  closedAt?: string;
  duration: string;
  durationFormatted: string;
  openingBalance: number;
  closingBalance: number;
  expectedBalance: number;
  difference: number;
  totalCash: number;
  totalCard: number;
  totalSales: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  orders: OrderSummary[];
  paymentBreakdown: PaymentBreakdown[];
  hourlySales: HourlySales[];
  handovers: ShiftHandover[];
  isForceClose: boolean;
  forceCloseReason?: string;
  notes?: string;
}
```


### 4.2 Frontend Implementation Notes

#### LocalStorage Recovery

```typescript
// client/src/utils/shiftRecovery.ts

const SHIFT_STORAGE_KEY = 'kasserpro_shift_state';

export interface ShiftState {
  shiftId: number;
  lastSaved: string;
  openingBalance: number;
  currentOrders: number;
}

export const saveShiftState = (shift: Shift) => {
  const state: ShiftState = {
    shiftId: shift.id,
    lastSaved: new Date().toISOString(),
    openingBalance: shift.openingBalance,
    currentOrders: shift.totalOrders,
  };
  localStorage.setItem(SHIFT_STORAGE_KEY, JSON.stringify(state));
};

export const getShiftState = (): ShiftState | null => {
  const stored = localStorage.getItem(SHIFT_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const clearShiftState = () => {
  localStorage.removeItem(SHIFT_STORAGE_KEY);
};

// Auto-save every minute
setInterval(() => {
  const currentShift = store.getState().shift.currentShift;
  if (currentShift && !currentShift.isClosed) {
    saveShiftState(currentShift);
  }
}, 60000); // 60 seconds
```

#### Inactivity Warning

```typescript
// client/src/hooks/useInactivityWarning.ts

export const useInactivityWarning = (shift: Shift | null) => {
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    if (!shift || shift.isClosed) return;
    
    const checkInactivity = () => {
      const lastActivity = new Date(shift.lastActivityAt);
      const hoursSinceActivity = 
        (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceActivity >= 12) {
        setShowWarning(true);
      }
    };
    
    // Check every 5 minutes
    const interval = setInterval(checkInactivity, 5 * 60 * 1000);
    checkInactivity(); // Check immediately
    
    return () => clearInterval(interval);
  }, [shift]);
  
  return { showWarning, dismissWarning: () => setShowWarning(false) };
};
```

---

## 5. Testing Strategy

### 5.1 Unit Tests

```csharp
[Fact]
public async Task ForceCloseAsync_AdminOnly_Success()
{
    // Test that only Admin can force close
}

[Fact]
public async Task HandoverShiftAsync_ValidUser_Success()
{
    // Test successful handover
}

[Fact]
public async Task HandoverShiftAsync_UserHasOpenShift_Fails()
{
    // Test validation: target user cannot have open shift
}
```

### 5.2 E2E Tests

```typescript
test('Cashier can handover shift to another cashier', async ({ page }) => {
  // 1. Login as Cashier 1
  // 2. Open shift
  // 3. Create some orders
  // 4. Handover to Cashier 2
  // 5. Login as Cashier 2
  // 6. Acknowledge handover
  // 7. Verify shift ownership changed
});

test('Admin can force close any shift', async ({ page }) => {
  // 1. Login as Cashier, open shift
  // 2. Logout, login as Admin
  // 3. Force close cashier's shift
  // 4. Verify shift closed with reason
});
```

---


# الميزة 3: المخزون الخاص بكل فرع

## 1. Database Schema

### 1.1 New Entities

#### BranchInventory Entity

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class BranchInventory : BaseEntity
{
    public int TenantId { get; set; }
    public int BranchId { get; set; }
    public int ProductId { get; set; }
    
    /// <summary>
    /// Current stock quantity for this product in this branch
    /// </summary>
    public int Quantity { get; set; }
    
    /// <summary>
    /// Reorder point specific to this branch
    /// </summary>
    public int? ReorderPoint { get; set; }
    
    /// <summary>
    /// Low stock threshold for alerts
    /// </summary>
    public int? LowStockThreshold { get; set; }
    
    /// <summary>
    /// Last time stock was updated
    /// </summary>
    public DateTime LastStockUpdate { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Last time stock was counted/reconciled
    /// </summary>
    public DateTime? LastStockCount { get; set; }
    
    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
```

#### BranchProductPrice Entity

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class BranchProductPrice : BaseEntity
{
    public int TenantId { get; set; }
    public int BranchId { get; set; }
    public int ProductId { get; set; }
    
    /// <summary>
    /// Branch-specific price (overrides Product.Price)
    /// null = use default product price
    /// </summary>
    public decimal? Price { get; set; }
    
    /// <summary>
    /// Branch-specific cost
    /// </summary>
    public decimal? Cost { get; set; }
    
    /// <summary>
    /// Effective date for this price
    /// </summary>
    public DateTime EffectiveDate { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Is this price currently active?
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
```

#### InventoryTransfer Entity

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

public class InventoryTransfer : BaseEntity
{
    public int TenantId { get; set; }
    
    /// <summary>
    /// Transfer number (auto-generated: IT-2026-0001)
    /// </summary>
    public string TransferNumber { get; set; } = string.Empty;
    
    public int FromBranchId { get; set; }
    public int ToBranchId { get; set; }
    public int ProductId { get; set; }
    
    /// <summary>
    /// Product snapshot at transfer time
    /// </summary>
    public string ProductName { get; set; } = string.Empty;
    public string? ProductSku { get; set; }
    
    public int Quantity { get; set; }
    
    public InventoryTransferStatus Status { get; set; } = InventoryTransferStatus.Pending;
    
    /// <summary>
    /// Reason for transfer
    /// </summary>
    public string Reason { get; set; } = string.Empty;
    
    public string? Notes { get; set; }
    
    /// <summary>
    /// User who initiated the transfer
    /// </summary>
    public int CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    
    /// <summary>
    /// User who approved the transfer (Admin only)
    /// </summary>
    public int? ApprovedByUserId { get; set; }
    public string? ApprovedByUserName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    
    /// <summary>
    /// User who received the transfer at destination
    /// </summary>
    public int? ReceivedByUserId { get; set; }
    public string? ReceivedByUserName { get; set; }
    public DateTime? ReceivedAt { get; set; }
    
    /// <summary>
    /// User who cancelled the transfer
    /// </summary>
    public int? CancelledByUserId { get; set; }
    public string? CancelledByUserName { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }
    
    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public Branch FromBranch { get; set; } = null!;
    public Branch ToBranch { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public User CreatedByUser { get; set; } = null!;
    public User? ApprovedByUser { get; set; }
    public User? ReceivedByUser { get; set; }
}
```

### 1.2 New Enums

```csharp
namespace KasserPro.Domain.Enums;

public enum InventoryTransferStatus
{
    /// <summary>
    /// Transfer created, waiting for approval
    /// </summary>
    Pending = 0,
    
    /// <summary>
    /// Transfer approved by Admin, in transit
    /// </summary>
    Approved = 1,
    
    /// <summary>
    /// Transfer received at destination
    /// </summary>
    Completed = 2,
    
    /// <summary>
    /// Transfer cancelled
    /// </summary>
    Cancelled = 3
}
```

### 1.3 Modified Entities

#### Product Entity - Remove Branch-Level Fields

```csharp
// REMOVE these fields (moved to BranchInventory):
// public int? StockQuantity { get; set; }
// public int? LowStockThreshold { get; set; }
// public int? ReorderPoint { get; set; }
// public DateTime? LastStockUpdate { get; set; }

// ADD navigation:
public ICollection<BranchInventory> BranchInventories { get; set; } = new List<BranchInventory>();
public ICollection<BranchProductPrice> BranchPrices { get; set; } = new List<BranchProductPrice>();
public ICollection<InventoryTransfer> InventoryTransfers { get; set; } = new List<InventoryTransfer>();
```

#### Branch Entity - Add Warehouse Flag

```csharp
// Add to existing Branch entity:

/// <summary>
/// Is this branch a central warehouse?
/// </summary>
public bool IsWarehouse { get; set; } = false;

// Navigation
public ICollection<BranchInventory> Inventories { get; set; } = new List<BranchInventory>();
public ICollection<BranchProductPrice> ProductPrices { get; set; } = new List<BranchProductPrice>();
public ICollection<InventoryTransfer> TransfersFrom { get; set; } = new List<InventoryTransfer>();
public ICollection<InventoryTransfer> TransfersTo { get; set; } = new List<InventoryTransfer>();
```

### 1.4 Relationships & Indexes

```csharp
// In ApplicationDbContext.OnModelCreating:

// BranchInventory
modelBuilder.Entity<BranchInventory>(entity =>
{
    entity.HasIndex(e => new { e.BranchId, e.ProductId }).IsUnique();
    entity.HasIndex(e => new { e.TenantId, e.BranchId });
    entity.HasIndex(e => e.Quantity);
    
    entity.HasOne(e => e.Product)
        .WithMany(p => p.BranchInventories)
        .HasForeignKey(e => e.ProductId)
        .OnDelete(DeleteBehavior.Cascade);
});

// BranchProductPrice
modelBuilder.Entity<BranchProductPrice>(entity =>
{
    entity.HasIndex(e => new { e.BranchId, e.ProductId, e.IsActive });
    entity.HasIndex(e => e.EffectiveDate);
    
    entity.HasOne(e => e.Product)
        .WithMany(p => p.BranchPrices)
        .HasForeignKey(e => e.ProductId)
        .OnDelete(DeleteBehavior.Cascade);
});

// InventoryTransfer
modelBuilder.Entity<InventoryTransfer>(entity =>
{
    entity.HasIndex(e => e.TransferNumber).IsUnique();
    entity.HasIndex(e => new { e.TenantId, e.Status });
    entity.HasIndex(e => new { e.FromBranchId, e.Status });
    entity.HasIndex(e => new { e.ToBranchId, e.Status });
    
    entity.HasOne(e => e.FromBranch)
        .WithMany(b => b.TransfersFrom)
        .HasForeignKey(e => e.FromBranchId)
        .OnDelete(DeleteBehavior.Restrict);
        
    entity.HasOne(e => e.ToBranch)
        .WithMany(b => b.TransfersTo)
        .HasForeignKey(e => e.ToBranchId)
        .OnDelete(DeleteBehavior.Restrict);
});
```

### 1.5 Migration Notes

```bash
# Create migration
dotnet ef migrations add AddMultiBranchInventory --project src/KasserPro.Infrastructure

# Migration will:
# 1. Create BranchInventory table
# 2. Create BranchProductPrice table
# 3. Create InventoryTransfer table
# 4. Migrate existing Product.StockQuantity to BranchInventory
# 5. Remove stock fields from Product table
# 6. Add IsWarehouse to Branch table
# 7. Create indexes

# Data Migration Script:
# For each existing Product with StockQuantity:
#   - Create BranchInventory record for each Branch
#   - Set Quantity = Product.StockQuantity (or 0 if null)
#   - Set ReorderPoint = Product.ReorderPoint
#   - Set LowStockThreshold = Product.LowStockThreshold
```

---

## 2. API Contracts

### 2.1 Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/inventory/branch/{branchId}` | Admin | Get inventory for branch |
| GET | `/api/inventory/product/{productId}` | Admin | Get inventory across all branches |
| POST | `/api/inventory/adjust` | Admin | Adjust inventory (manual) |
| POST | `/api/inventory/transfer` | Admin | Create transfer request |
| POST | `/api/inventory/transfer/{id}/approve` | Admin | Approve transfer |
| POST | `/api/inventory/transfer/{id}/receive` | Admin | Receive transfer |
| POST | `/api/inventory/transfer/{id}/cancel` | Admin | Cancel transfer |
| GET | `/api/inventory/low-stock` | Admin | Get low stock alerts |
| GET | `/api/branch-prices/{branchId}` | Admin | Get branch-specific prices |
| POST | `/api/branch-prices` | Admin | Set branch-specific price |
| DELETE | `/api/branch-prices/{id}` | Admin | Remove branch price override |

### 2.2 Request DTOs

```csharp
namespace KasserPro.Application.DTOs.Inventory;

public class AdjustInventoryRequest
{
    public int BranchId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; } // Can be positive or negative
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class CreateTransferRequest
{
    public int FromBranchId { get; set; }
    public int ToBranchId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class SetBranchPriceRequest
{
    public int BranchId { get; set; }
    public int ProductId { get; set; }
    public decimal Price { get; set; }
    public decimal? Cost { get; set; }
}
```

### 2.3 Response DTOs

```csharp
namespace KasserPro.Application.DTOs.Inventory;

public class BranchInventoryDto
{
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductSku { get; set; }
    public int Quantity { get; set; }
    public int? ReorderPoint { get; set; }
    public int? LowStockThreshold { get; set; }
    public bool IsLowStock { get; set; }
    public DateTime LastStockUpdate { get; set; }
}

public class InventoryTransferDto
{
    public int Id { get; set; }
    public string TransferNumber { get; set; } = string.Empty;
    public int FromBranchId { get; set; }
    public string FromBranchName { get; set; } = string.Empty;
    public int ToBranchId { get; set; }
    public string ToBranchName { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? ApprovedByUserName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ReceivedByUserName { get; set; }
    public DateTime? ReceivedAt { get; set; }
}

public class BranchProductPriceDto
{
    public int Id { get; set; }
    public int BranchId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? Cost { get; set; }
    public decimal DefaultPrice { get; set; }
    public DateTime EffectiveDate { get; set; }
}
```


### 2.4 Validation Rules

| Field | Rule | Error Code |
|-------|------|------------|
| FromBranchId | Must exist | `BRANCH_NOT_FOUND` |
| ToBranchId | Must exist and be different | `INVENTORY_TRANSFER_SAME_BRANCH` |
| Quantity | Must be > 0 | `INVENTORY_INVALID_QUANTITY` |
| Quantity | Must not exceed available stock | `INVENTORY_INSUFFICIENT_STOCK` |
| Price | Must be >= 0 | `PRODUCT_INVALID_PRICE` |

### 2.5 Error Codes (New)

```csharp
public static partial class ErrorCodes
{
    // Inventory Errors (7xxx)
    public const string INVENTORY_NOT_FOUND = "INVENTORY_NOT_FOUND";
    public const string INVENTORY_INVALID_QUANTITY = "INVENTORY_INVALID_QUANTITY";
    public const string INVENTORY_INSUFFICIENT_STOCK = "INVENTORY_INSUFFICIENT_STOCK";
    public const string INVENTORY_TRANSFER_SAME_BRANCH = "INVENTORY_TRANSFER_SAME_BRANCH";
    public const string INVENTORY_TRANSFER_NOT_FOUND = "INVENTORY_TRANSFER_NOT_FOUND";
    public const string INVENTORY_TRANSFER_ALREADY_APPROVED = "INVENTORY_TRANSFER_ALREADY_APPROVED";
    public const string INVENTORY_TRANSFER_NOT_APPROVED = "INVENTORY_TRANSFER_NOT_APPROVED";
}
```

---

## 3. Business Logic

### 3.1 Service Methods

```csharp
namespace KasserPro.Application.Services;

public interface IInventoryService
{
    // Inventory Queries
    Task<ApiResponse<List<BranchInventoryDto>>> GetBranchInventoryAsync(int branchId);
    
    Task<ApiResponse<List<BranchInventoryDto>>> GetProductInventoryAcrossBranchesAsync(int productId);
    
    Task<ApiResponse<List<BranchInventoryDto>>> GetLowStockItemsAsync(int? branchId = null);
    
    // Inventory Adjustments
    Task<ApiResponse<bool>> AdjustInventoryAsync(AdjustInventoryRequest request);
    
    // Transfers
    Task<ApiResponse<InventoryTransferDto>> CreateTransferAsync(CreateTransferRequest request);
    
    Task<ApiResponse<InventoryTransferDto>> ApproveTransferAsync(int transferId);
    
    Task<ApiResponse<InventoryTransferDto>> ReceiveTransferAsync(int transferId);
    
    Task<ApiResponse<InventoryTransferDto>> CancelTransferAsync(int transferId, string reason);
    
    // Branch Prices
    Task<ApiResponse<List<BranchProductPriceDto>>> GetBranchPricesAsync(int branchId);
    
    Task<ApiResponse<BranchProductPriceDto>> SetBranchPriceAsync(SetBranchPriceRequest request);
    
    Task<ApiResponse<bool>> RemoveBranchPriceAsync(int branchId, int productId);
    
    // Helper
    Task<decimal> GetEffectivePriceAsync(int productId, int branchId);
}
```

### 3.2 Business Rules

#### Rule 1: Get Effective Price (Branch Override)

```csharp
public async Task<decimal> GetEffectivePriceAsync(int productId, int branchId)
{
    // Check for branch-specific price
    var branchPrice = await _branchPriceRepository
        .GetActivePriceAsync(branchId, productId);
    
    if (branchPrice?.Price != null)
        return branchPrice.Price.Value;
    
    // Fall back to default product price
    var product = await _productRepository.GetByIdAsync(productId);
    return product.Price;
}
```

#### Rule 2: Inventory Transfer Flow

```csharp
public async Task<ApiResponse<InventoryTransferDto>> CreateTransferAsync(CreateTransferRequest request)
{
    await using var transaction = await _unitOfWork.BeginTransactionAsync();
    try
    {
        // Validate branches
        if (request.FromBranchId == request.ToBranchId)
            return ApiResponse<InventoryTransferDto>.Fail(ErrorCodes.INVENTORY_TRANSFER_SAME_BRANCH);
        
        // Check stock availability
        var inventory = await _inventoryRepository
            .GetByBranchAndProductAsync(request.FromBranchId, request.ProductId);
        
        if (inventory == null || inventory.Quantity < request.Quantity)
            return ApiResponse<InventoryTransferDto>.Fail(ErrorCodes.INVENTORY_INSUFFICIENT_STOCK);
        
        // Get product for snapshot
        var product = await _productRepository.GetByIdAsync(request.ProductId);
        
        // Generate transfer number
        var transferNumber = await GenerateTransferNumberAsync();
        
        // Create transfer
        var transfer = new InventoryTransfer
        {
            TenantId = _currentUserService.TenantId,
            TransferNumber = transferNumber,
            FromBranchId = request.FromBranchId,
            ToBranchId = request.ToBranchId,
            ProductId = request.ProductId,
            ProductName = product.Name,
            ProductSku = product.Sku,
            Quantity = request.Quantity,
            Status = InventoryTransferStatus.Pending,
            Reason = request.Reason,
            Notes = request.Notes,
            CreatedByUserId = _currentUserService.UserId,
            CreatedByUserName = _currentUserService.UserName
        };
        
        await _transferRepository.CreateAsync(transfer);
        await transaction.CommitAsync();
        
        return ApiResponse<InventoryTransferDto>.Success(_mapper.Map<InventoryTransferDto>(transfer));
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}

public async Task<ApiResponse<InventoryTransferDto>> ApproveTransferAsync(int transferId)
{
    await using var transaction = await _unitOfWork.BeginTransactionAsync();
    try
    {
        var transfer = await _transferRepository.GetByIdAsync(transferId);
        
        if (transfer.Status != InventoryTransferStatus.Pending)
            return ApiResponse<InventoryTransferDto>.Fail(ErrorCodes.INVENTORY_TRANSFER_ALREADY_APPROVED);
        
        // Deduct from source branch
        var fromInventory = await _inventoryRepository
            .GetByBranchAndProductAsync(transfer.FromBranchId, transfer.ProductId);
        
        if (fromInventory.Quantity < transfer.Quantity)
            return ApiResponse<InventoryTransferDto>.Fail(ErrorCodes.INVENTORY_INSUFFICIENT_STOCK);
        
        fromInventory.Quantity -= transfer.Quantity;
        fromInventory.LastStockUpdate = DateTime.UtcNow;
        await _inventoryRepository.UpdateAsync(fromInventory);
        
        // Create stock movement for source
        var movementFrom = new StockMovement
        {
            TenantId = transfer.TenantId,
            BranchId = transfer.FromBranchId,
            ProductId = transfer.ProductId,
            Type = StockMovementType.Transfer,
            Quantity = -transfer.Quantity,
            ReferenceType = "InventoryTransfer",
            ReferenceId = transfer.Id,
            Notes = $"Transfer to {transfer.ToBranch.Name}: {transfer.TransferNumber}",
            UserId = _currentUserService.UserId
        };
        await _stockMovementRepository.CreateAsync(movementFrom);
        
        // Update transfer status
        transfer.Status = InventoryTransferStatus.Approved;
        transfer.ApprovedByUserId = _currentUserService.UserId;
        transfer.ApprovedByUserName = _currentUserService.UserName;
        transfer.ApprovedAt = DateTime.UtcNow;
        
        await _transferRepository.UpdateAsync(transfer);
        await transaction.CommitAsync();
        
        return ApiResponse<InventoryTransferDto>.Success(_mapper.Map<InventoryTransferDto>(transfer));
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}

public async Task<ApiResponse<InventoryTransferDto>> ReceiveTransferAsync(int transferId)
{
    await using var transaction = await _unitOfWork.BeginTransactionAsync();
    try
    {
        var transfer = await _transferRepository.GetByIdAsync(transferId);
        
        if (transfer.Status != InventoryTransferStatus.Approved)
            return ApiResponse<InventoryTransferDto>.Fail(ErrorCodes.INVENTORY_TRANSFER_NOT_APPROVED);
        
        // Add to destination branch
        var toInventory = await _inventoryRepository
            .GetByBranchAndProductAsync(transfer.ToBranchId, transfer.ProductId);
        
        if (toInventory == null)
        {
            // Create inventory record if doesn't exist
            toInventory = new BranchInventory
            {
                TenantId = transfer.TenantId,
                BranchId = transfer.ToBranchId,
                ProductId = transfer.ProductId,
                Quantity = 0
            };
            await _inventoryRepository.CreateAsync(toInventory);
        }
        
        toInventory.Quantity += transfer.Quantity;
        toInventory.LastStockUpdate = DateTime.UtcNow;
        await _inventoryRepository.UpdateAsync(toInventory);
        
        // Create stock movement for destination
        var movementTo = new StockMovement
        {
            TenantId = transfer.TenantId,
            BranchId = transfer.ToBranchId,
            ProductId = transfer.ProductId,
            Type = StockMovementType.Transfer,
            Quantity = transfer.Quantity,
            ReferenceType = "InventoryTransfer",
            ReferenceId = transfer.Id,
            Notes = $"Transfer from {transfer.FromBranch.Name}: {transfer.TransferNumber}",
            UserId = _currentUserService.UserId
        };
        await _stockMovementRepository.CreateAsync(movementTo);
        
        // Update transfer status
        transfer.Status = InventoryTransferStatus.Completed;
        transfer.ReceivedByUserId = _currentUserService.UserId;
        transfer.ReceivedByUserName = _currentUserService.UserName;
        transfer.ReceivedAt = DateTime.UtcNow;
        
        await _transferRepository.UpdateAsync(transfer);
        await transaction.CommitAsync();
        
        return ApiResponse<InventoryTransferDto>.Success(_mapper.Map<InventoryTransferDto>(transfer));
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

#### Rule 3: Low Stock Detection

```csharp
public async Task<ApiResponse<List<BranchInventoryDto>>> GetLowStockItemsAsync(int? branchId = null)
{
    var query = _inventoryRepository.GetAll()
        .Where(i => i.TenantId == _currentUserService.TenantId);
    
    if (branchId.HasValue)
        query = query.Where(i => i.BranchId == branchId.Value);
    
    // Low stock = Quantity <= LowStockThreshold (if set) OR Quantity <= ReorderPoint
    var lowStockItems = await query
        .Where(i => 
            (i.LowStockThreshold.HasValue && i.Quantity <= i.LowStockThreshold.Value) ||
            (i.ReorderPoint.HasValue && i.Quantity <= i.ReorderPoint.Value))
        .Include(i => i.Branch)
        .Include(i => i.Product)
        .ToListAsync();
    
    var dtos = lowStockItems.Select(i => new BranchInventoryDto
    {
        BranchId = i.BranchId,
        BranchName = i.Branch.Name,
        ProductId = i.ProductId,
        ProductName = i.Product.Name,
        ProductSku = i.Product.Sku,
        Quantity = i.Quantity,
        ReorderPoint = i.ReorderPoint,
        LowStockThreshold = i.LowStockThreshold,
        IsLowStock = true,
        LastStockUpdate = i.LastStockUpdate
    }).ToList();
    
    return ApiResponse<List<BranchInventoryDto>>.Success(dtos);
}
```

### 3.3 Transaction Boundaries

- `CreateTransferAsync` - Creates transfer record
- `ApproveTransferAsync` - Deducts from source + creates stock movement
- `ReceiveTransferAsync` - Adds to destination + creates stock movement
- `AdjustInventoryAsync` - Updates inventory + creates stock movement

### 3.4 Audit Trail Points

- Create inventory transfer
- Approve inventory transfer
- Receive inventory transfer
- Cancel inventory transfer
- Manual inventory adjustment
- Set branch-specific price

---

## 4. Frontend Types

```typescript
// client/src/types/inventory.ts

export type InventoryTransferStatus = 'Pending' | 'Approved' | 'Completed' | 'Cancelled';

export interface BranchInventory {
  branchId: number;
  branchName: string;
  productId: number;
  productName: string;
  productSku?: string;
  quantity: number;
  reorderPoint?: number;
  lowStockThreshold?: number;
  isLowStock: boolean;
  lastStockUpdate: string;
}

export interface InventoryTransfer {
  id: number;
  transferNumber: string;
  fromBranchId: number;
  fromBranchName: string;
  toBranchId: number;
  toBranchName: string;
  productId: number;
  productName: string;
  quantity: number;
  status: InventoryTransferStatus;
  reason: string;
  notes?: string;
  createdByUserName: string;
  createdAt: string;
  approvedByUserName?: string;
  approvedAt?: string;
  receivedByUserName?: string;
  receivedAt?: string;
}

export interface CreateTransferRequest {
  fromBranchId: number;
  toBranchId: number;
  productId: number;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface BranchProductPrice {
  id: number;
  branchId: number;
  branchName: string;
  productId: number;
  productName: string;
  price: number;
  cost?: number;
  defaultPrice: number;
  effectiveDate: string;
}
```

---

## 5. Testing Strategy

### 5.1 Unit Tests

```csharp
[Fact]
public async Task GetEffectivePrice_BranchOverride_ReturnsBranchPrice()
{
    // Test that branch price overrides default
}

[Fact]
public async Task ApproveTransfer_InsufficientStock_Fails()
{
    // Test validation
}

[Fact]
public async Task ReceiveTransfer_NotApproved_Fails()
{
    // Test status validation
}
```

### 5.2 E2E Tests

```typescript
test('Admin can transfer inventory between branches', async ({ page }) => {
  // 1. Login as Admin
  // 2. Create transfer request
  // 3. Approve transfer
  // 4. Receive transfer
  // 5. Verify inventory updated in both branches
});
```

---


# الميزة 4: التكامل مع الأجهزة (الطابعات والماسحات)

## 1. Database Schema

### 1.1 New Entities

#### PrinterSettings Entity

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

public class PrinterSettings : BaseEntity
{
    public int TenantId { get; set; }
    public int BranchId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public PrinterType Type { get; set; }
    public string PrinterName { get; set; } = string.Empty; // System printer name
    public int PaperWidth { get; set; } = 80; // mm (58, 80)
    public bool IsDefault { get; set; } = false;
    public bool AutoPrint { get; set; } = false; // Auto-print on order complete
    public bool IsActive { get; set; } = true;
    
    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
}
```

### 1.2 New Enums

```csharp
namespace KasserPro.Domain.Enums;

public enum PrinterType
{
    Receipt = 0,    // Receipt printer (for customer)
    Kitchen = 1,    // Kitchen printer (future)
    Report = 2      // Report printer
}
```

---

## 2. API Contracts

### 2.1 Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/printers` | Admin | Get all printers for branch |
| POST | `/api/printers` | Admin | Add printer |
| PUT | `/api/printers/{id}` | Admin | Update printer |
| DELETE | `/api/printers/{id}` | Admin | Delete printer |
| POST | `/api/printers/{id}/test` | Admin | Test print |
| POST | `/api/print/receipt/{orderId}` | Cashier, Admin | Print receipt |
| POST | `/api/print/report/{shiftId}` | Cashier, Admin | Print shift report |

### 2.2 SignalR Hub

```csharp
namespace KasserPro.API.Hubs;

using Microsoft.AspNetCore.SignalR;

public class PrinterHub : Hub
{
    public async Task RegisterDesktopApp(int branchId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Branch_{branchId}");
    }
    
    public async Task PrintReceipt(int orderId, string receiptHtml)
    {
        // Desktop app calls this after printing
        await Clients.All.SendAsync("ReceiptPrinted", orderId);
    }
}
```

### 2.3 Desktop App Communication

```csharp
// Backend sends print job to Desktop App via SignalR
public async Task<ApiResponse<bool>> PrintReceiptAsync(int orderId)
{
    var order = await _orderRepository.GetByIdAsync(orderId);
    var printer = await _printerRepository.GetDefaultReceiptPrinterAsync(order.BranchId);
    
    if (printer == null)
        return ApiResponse<bool>.Fail("NO_PRINTER_CONFIGURED");
    
    var receiptHtml = await _receiptService.GenerateReceiptHtmlAsync(order);
    
    // Send to Desktop App via SignalR
    await _hubContext.Clients
        .Group($"Branch_{order.BranchId}")
        .SendAsync("PrintJob", new
        {
            Type = "Receipt",
            OrderId = orderId,
            PrinterName = printer.PrinterName,
            PaperWidth = printer.PaperWidth,
            Content = receiptHtml
        });
    
    return ApiResponse<bool>.Success(true);
}
```

---

## 3. Desktop App Architecture

### 3.1 Technology Stack

- **.NET 9 WPF** (Windows Desktop Application)
- **SignalR Client** (for real-time communication)
- **ESC/POS Library** (for thermal printer commands)
- **HID Scanner Support** (for barcode scanners)

### 3.2 Desktop App Structure

```
KasserPro.DesktopApp/
├── Services/
│   ├── PrinterService.cs       # Handles printing
│   ├── ScannerService.cs       # Handles barcode scanning
│   └── SignalRService.cs       # SignalR connection
├── Models/
│   ├── PrintJob.cs
│   └── ScanResult.cs
├── Views/
│   └── MainWindow.xaml         # Simple status UI
└── App.xaml.cs
```

### 3.3 Key Features

```csharp
// PrinterService.cs
public class PrinterService
{
    public async Task<bool> PrintReceiptAsync(PrintJob job)
    {
        try
        {
            // Convert HTML to ESC/POS commands
            var escPosCommands = ConvertToEscPos(job.Content, job.PaperWidth);
            
            // Send to printer
            await SendToPrinterAsync(job.PrinterName, escPosCommands);
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Print failed");
            return false;
        }
    }
    
    private byte[] ConvertToEscPos(string html, int paperWidth)
    {
        // Convert HTML to ESC/POS commands
        // Support: text, bold, alignment, cut paper
        // Library: ESCPOS.NET or similar
    }
}

// ScannerService.cs
public class ScannerService
{
    public event EventHandler<string> BarcodeScanned;
    
    public void StartListening()
    {
        // Listen for HID scanner input
        // Most scanners act as keyboard input
        // Detect barcode pattern and raise event
    }
}
```

---

## 4. Frontend Integration

### 4.1 TypeScript Types

```typescript
// client/src/types/printer.ts

export type PrinterType = 'Receipt' | 'Kitchen' | 'Report';

export interface PrinterSettings {
  id: number;
  name: string;
  type: PrinterType;
  printerName: string;
  paperWidth: number;
  isDefault: boolean;
  autoPrint: boolean;
  isActive: boolean;
}

export interface PrintJob {
  type: string;
  orderId?: number;
  shiftId?: number;
  printerName: string;
  paperWidth: number;
  content: string;
}
```

### 4.2 Print Button Component

```typescript
// client/src/components/PrintButton.tsx

export const PrintButton: React.FC<{ orderId: number }> = ({ orderId }) => {
  const [printReceipt] = usePrintReceiptMutation();
  
  const handlePrint = async () => {
    try {
      await printReceipt(orderId).unwrap();
      toast.success('تم إرسال الطباعة');
    } catch (error) {
      toast.error('فشل الطباعة');
    }
  };
  
  return (
    <button onClick={handlePrint}>
      <PrinterIcon /> طباعة
    </button>
  );
};
```

---

## 5. Testing Strategy

### 5.1 Integration Tests

```csharp
[Fact]
public async Task PrintReceipt_ValidOrder_SendsSignalRMessage()
{
    // Test that SignalR message is sent
}
```

### 5.2 Desktop App Testing

- Manual testing with actual thermal printers
- Test different paper widths (58mm, 80mm)
- Test barcode scanner integration
- Test reconnection after network loss

---


# الميزة 5: تحديث بيانات الاختبار (Seed Data)

## 1. Architecture

### 1.1 Seeder Classes Structure

```
src/KasserPro.Infrastructure/Data/Seeders/
├── DbInitializer.cs                    # Main orchestrator
├── TenantSeeder.cs                     # Tenant & branches
├── UserSeeder.cs                       # Users & roles
├── CategorySeeder.cs                   # Product categories
├── ProductSeeder.cs                    # Products
├── SupplierSeeder.cs                   # Suppliers
├── PurchaseInvoiceSeeder.cs            # Purchase invoices
├── CustomerSeeder.cs                   # Customers
├── OrderSeeder.cs                      # Orders & payments
├── ShiftSeeder.cs                      # Shifts
├── ExpenseSeeder.cs                    # Expenses
└── Scenarios/
    ├── SmallScenario.cs                # 100 products, 500 orders
    ├── MediumScenario.cs               # 500 products, 5000 orders
    ├── LargeScenario.cs                # 2000 products, 20000 orders
    └── DemoScenario.cs                 # Beautiful data for demos
```

### 1.2 DbInitializer

```csharp
namespace KasserPro.Infrastructure.Data.Seeders;

public class DbInitializer
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DbInitializer> _logger;
    
    public async Task SeedAsync(string scenario = "medium")
    {
        _logger.LogInformation("Starting database seeding - Scenario: {Scenario}", scenario);
        
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            // 1. Clear existing data (except users)
            await ClearDataAsync();
            
            // 2. Seed base data
            await SeedTenantsAndBranchesAsync();
            await SeedUsersAsync();
            await SeedCategoriesAsync();
            await SeedSuppliersAsync();
            
            // 3. Seed scenario-specific data
            var scenarioSeeder = scenario.ToLower() switch
            {
                "small" => new SmallScenario(_context),
                "medium" => new MediumScenario(_context),
                "large" => new LargeScenario(_context),
                "demo" => new DemoScenario(_context),
                _ => new MediumScenario(_context)
            };
            
            await scenarioSeeder.SeedAsync();
            
            stopwatch.Stop();
            _logger.LogInformation("Database seeding completed in {Elapsed}ms", stopwatch.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database seeding failed");
            throw;
        }
    }
    
    private async Task ClearDataAsync()
    {
        _logger.LogInformation("Clearing existing data...");
        
        // Clear in correct order (respect foreign keys)
        _context.Payments.RemoveRange(_context.Payments);
        _context.OrderItems.RemoveRange(_context.OrderItems);
        _context.Orders.RemoveRange(_context.Orders);
        _context.Shifts.RemoveRange(_context.Shifts);
        _context.PurchaseInvoicePayments.RemoveRange(_context.PurchaseInvoicePayments);
        _context.PurchaseInvoiceItems.RemoveRange(_context.PurchaseInvoiceItems);
        _context.PurchaseInvoices.RemoveRange(_context.PurchaseInvoices);
        _context.Expenses.RemoveRange(_context.Expenses);
        _context.CashRegisterTransactions.RemoveRange(_context.CashRegisterTransactions);
        _context.BranchInventories.RemoveRange(_context.BranchInventories);
        _context.SupplierProducts.RemoveRange(_context.SupplierProducts);
        _context.Products.RemoveRange(_context.Products);
        _context.Categories.RemoveRange(_context.Categories);
        _context.Suppliers.RemoveRange(_context.Suppliers);
        _context.Customers.RemoveRange(_context.Customers);
        
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Data cleared successfully");
    }
}
```

### 1.3 Realistic Data Generation

```csharp
// ProductSeeder.cs
public class ProductSeeder
{
    private readonly string[] _arabicProductNames = new[]
    {
        "قهوة عربية", "شاي أخضر", "عصير برتقال", "ماء معدني",
        "كرواسون", "كعك بالسمسم", "فطيرة تفاح", "دونات شوكولاتة",
        "ساندويتش جبنة", "برجر لحم", "بيتزا مارجريتا", "معكرونة",
        // ... 100+ realistic names
    };
    
    private readonly string[] _categories = new[]
    {
        "مشروبات ساخنة", "مشروبات باردة", "معجنات", "وجبات سريعة",
        "حلويات", "سلطات", "مقبلات"
    };
    
    public async Task SeedAsync(int count)
    {
        var random = new Random();
        var products = new List<Product>();
        
        for (int i = 0; i < count; i++)
        {
            var name = _arabicProductNames[random.Next(_arabicProductNames.Length)];
            var category = _categories[random.Next(_categories.Length)];
            
            products.Add(new Product
            {
                TenantId = 1,
                Name = $"{name} {i + 1}",
                NameEn = TranslateToEnglish(name),
                Price = GenerateRealisticPrice(category),
                Cost = GenerateRealisticCost(category),
                Sku = $"PRD-{i + 1:D6}",
                Barcode = GenerateBarcode(),
                CategoryId = GetCategoryId(category),
                IsActive = true,
                TrackInventory = true,
                ImageUrl = GetRandomImage(category)
            });
        }
        
        await _context.Products.AddRangeAsync(products);
        await _context.SaveChangesAsync();
    }
    
    private decimal GenerateRealisticPrice(string category)
    {
        return category switch
        {
            "مشروبات ساخنة" => Random.Shared.Next(15, 35),
            "مشروبات باردة" => Random.Shared.Next(10, 25),
            "معجنات" => Random.Shared.Next(5, 20),
            "وجبات سريعة" => Random.Shared.Next(30, 80),
            "حلويات" => Random.Shared.Next(15, 40),
            _ => Random.Shared.Next(10, 50)
        };
    }
}

// OrderSeeder.cs
public class OrderSeeder
{
    public async Task SeedAsync(int count, DateTime startDate, DateTime endDate)
    {
        var random = new Random();
        var orders = new List<Order>();
        
        // Realistic distribution: more orders during peak hours
        var peakHours = new[] { 8, 9, 10, 12, 13, 14, 18, 19, 20 };
        
        for (int i = 0; i < count; i++)
        {
            var orderDate = GenerateRealisticDate(startDate, endDate, peakHours);
            var itemCount = random.Next(1, 6); // 1-5 items per order
            
            var order = new Order
            {
                TenantId = 1,
                BranchId = 1,
                OrderNumber = $"ORD-{i + 1:D8}",
                Status = OrderStatus.Completed,
                OrderType = GetRandomOrderType(),
                CreatedAt = orderDate,
                CompletedAt = orderDate.AddMinutes(random.Next(5, 30)),
                UserId = GetRandomCashierId(),
                ShiftId = GetShiftForDate(orderDate)
            };
            
            // Add items
            var items = GenerateOrderItems(itemCount, order.TenantId);
            order.Items = items;
            
            // Calculate totals
            CalculateOrderTotals(order);
            
            // Add payments
            order.Payments = GeneratePayments(order);
            
            orders.Add(order);
        }
        
        await _context.Orders.AddRangeAsync(orders);
        await _context.SaveChangesAsync();
    }
    
    private DateTime GenerateRealisticDate(DateTime start, DateTime end, int[] peakHours)
    {
        var random = new Random();
        var days = (end - start).Days;
        var randomDay = start.AddDays(random.Next(days));
        
        // 70% chance of peak hour, 30% chance of any hour
        var hour = random.NextDouble() < 0.7
            ? peakHours[random.Next(peakHours.Length)]
            : random.Next(8, 22);
        
        return randomDay.Date.AddHours(hour).AddMinutes(random.Next(60));
    }
}
```

---

## 2. CLI Commands

### 2.1 Program.cs Integration

```csharp
// src/KasserPro.API/Program.cs

var builder = WebApplication.CreateBuilder(args);

// ... existing configuration

var app = builder.Build();

// Seed command
if (args.Contains("--seed"))
{
    var scenario = args.Contains("--scenario") 
        ? args[Array.IndexOf(args, "--scenario") + 1] 
        : "medium";
    
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<DbInitializer>();
    await seeder.SeedAsync(scenario);
    
    Console.WriteLine($"✅ Database seeded successfully with '{scenario}' scenario");
    return;
}

app.Run();
```

### 2.2 Usage

```bash
# Seed with medium scenario (default)
dotnet run --project src/KasserPro.API --seed

# Seed with specific scenario
dotnet run --project src/KasserPro.API --seed --scenario small
dotnet run --project src/KasserPro.API --seed --scenario large
dotnet run --project src/KasserPro.API --seed --scenario demo

# Or create a script
# scripts/seed.ps1
dotnet run --project src/KasserPro.API --seed --scenario $args[0]
```

---

## 3. Scenarios

### 3.1 Small Scenario (Development)

```csharp
public class SmallScenario
{
    public async Task SeedAsync()
    {
        await SeedProducts(100);
        await SeedCustomers(50);
        await SeedOrders(500, DateTime.Now.AddMonths(-1), DateTime.Now);
        await SeedPurchaseInvoices(20);
        await SeedExpenses(30);
    }
}
```

### 3.2 Medium Scenario (Testing)

```csharp
public class MediumScenario
{
    public async Task SeedAsync()
    {
        await SeedProducts(500);
        await SeedCustomers(200);
        await SeedOrders(5000, DateTime.Now.AddMonths(-3), DateTime.Now);
        await SeedPurchaseInvoices(100);
        await SeedExpenses(150);
    }
}
```

### 3.3 Large Scenario (Performance Testing)

```csharp
public class LargeScenario
{
    public async Task SeedAsync()
    {
        await SeedProducts(2000);
        await SeedCustomers(1000);
        await SeedOrders(20000, DateTime.Now.AddMonths(-6), DateTime.Now);
        await SeedPurchaseInvoices(500);
        await SeedExpenses(600);
    }
}
```

### 3.4 Demo Scenario (Client Presentations)

```csharp
public class DemoScenario
{
    public async Task SeedAsync()
    {
        // Beautiful, curated data for demos
        await SeedCategoriesWithImages();
        await SeedProductsWithImages(50); // High-quality images
        await SeedRealisticCustomers(20);
        await SeedRealisticOrders(100); // Last 7 days only
        await SeedCompletedShifts(7); // One per day
    }
}
```

---

## 4. Testing Strategy

### 4.1 Seeder Tests

```csharp
[Fact]
public async Task SmallScenario_Seeds_CorrectCounts()
{
    // Arrange
    var scenario = new SmallScenario(_context);
    
    // Act
    await scenario.SeedAsync();
    
    // Assert
    Assert.Equal(100, await _context.Products.CountAsync());
    Assert.Equal(500, await _context.Orders.CountAsync());
}

[Fact]
public async Task OrderSeeder_GeneratesRealisticDates()
{
    // Test that orders are distributed realistically
}
```

---


# الميزة 6: الخزينة (Cash Register)

## 1. Database Schema

### 1.1 New Entities

#### CashRegister Entity

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class CashRegister : BaseEntity
{
    public int TenantId { get; set; }
    
    /// <summary>
    /// null = Company-wide cash register
    /// </summary>
    public int? BranchId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public decimal OpeningBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public DateTime OpenedAt { get; set; } = DateTime.UtcNow;
    public bool IsClosed { get; set; } = false;
    public DateTime? ClosedAt { get; set; }
    
    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public Branch? Branch { get; set; }
    public ICollection<CashRegisterTransaction> Transactions { get; set; } = new List<CashRegisterTransaction>();
    public ICollection<CashRegisterReconciliation> Reconciliations { get; set; } = new List<CashRegisterReconciliation>();
}
```

#### CashRegisterTransaction Entity

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

public class CashRegisterTransaction : BaseEntity
{
    public int CashRegisterId { get; set; }
    public int TenantId { get; set; }
    public int BranchId { get; set; }
    
    public CashRegisterTransactionType Type { get; set; }
    
    /// <summary>
    /// Positive = money in, Negative = money out
    /// </summary>
    public decimal Amount { get; set; }
    
    public string Description { get; set; } = string.Empty;
    
    /// <summary>
    /// Reference type (Order, Expense, Transfer, etc.)
    /// </summary>
    public string? ReferenceType { get; set; }
    
    /// <summary>
    /// Reference ID (OrderId, ExpenseId, etc.)
    /// </summary>
    public int? ReferenceId { get; set; }
    
    public string? Notes { get; set; }
    
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    
    // Navigation
    public CashRegister CashRegister { get; set; } = null!;
    public Tenant Tenant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public User User { get; set; } = null!;
}
```

#### CashRegisterReconciliation Entity

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class CashRegisterReconciliation : BaseEntity
{
    public int CashRegisterId { get; set; }
    public int TenantId { get; set; }
    public int BranchId { get; set; }
    
    public DateTime ReconciliationDate { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Expected balance (calculated from transactions)
    /// </summary>
    public decimal ExpectedBalance { get; set; }
    
    /// <summary>
    /// Actual balance (counted cash)
    /// </summary>
    public decimal ActualBalance { get; set; }
    
    /// <summary>
    /// Difference (ActualBalance - ExpectedBalance)
    /// </summary>
    public decimal Difference { get; set; }
    
    /// <summary>
    /// Percentage difference
    /// </summary>
    public decimal DifferencePercentage { get; set; }
    
    public string? Notes { get; set; }
    
    public int ReconciledByUserId { get; set; }
    public string ReconciledByUserName { get; set; } = string.Empty;
    
    // Navigation
    public CashRegister CashRegister { get; set; } = null!;
    public Tenant Tenant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public User ReconciledByUser { get; set; } = null!;
}
```

### 1.2 New Enums

```csharp
namespace KasserPro.Domain.Enums;

public enum CashRegisterTransactionType
{
    /// <summary>
    /// Cash from sales (from shifts)
    /// </summary>
    Sales = 0,
    
    /// <summary>
    /// Cash refunded to customers
    /// </summary>
    Refunds = 1,
    
    /// <summary>
    /// Cash paid for expenses
    /// </summary>
    Expenses = 2,
    
    /// <summary>
    /// Cash deposited to bank
    /// </summary>
    BankDeposits = 3,
    
    /// <summary>
    /// Cash withdrawn from register
    /// </summary>
    Withdrawals = 4,
    
    /// <summary>
    /// Cash transferred between branches
    /// </summary>
    Transfers = 5,
    
    /// <summary>
    /// Other transactions
    /// </summary>
    Other = 6
}
```

---

## 2. API Contracts

### 2.1 Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/cash-register/current` | Admin | Get current cash register |
| GET | `/api/cash-register/branch/{branchId}` | Admin | Get cash register for branch |
| POST | `/api/cash-register/open` | Admin | Open cash register |
| POST | `/api/cash-register/close` | Admin | Close cash register |
| POST | `/api/cash-register/transaction` | Admin | Add transaction |
| POST | `/api/cash-register/reconcile` | Admin | Reconcile cash register |
| GET | `/api/cash-register/transactions` | Admin | Get transactions (paginated) |
| GET | `/api/cash-register/report` | Admin | Get cash flow report |

### 2.2 Request/Response DTOs

```csharp
namespace KasserPro.Application.DTOs.CashRegister;

public class OpenCashRegisterRequest
{
    public int? BranchId { get; set; } // null = company-wide
    public decimal OpeningBalance { get; set; }
}

public class AddTransactionRequest
{
    public CashRegisterTransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? ReferenceType { get; set; }
    public int? ReferenceId { get; set; }
    public string? Notes { get; set; }
}

public class ReconcileCashRegisterRequest
{
    public decimal ActualBalance { get; set; }
    public string? Notes { get; set; }
}

public class CashRegisterDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int? BranchId { get; set; }
    public string? BranchName { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public DateTime OpenedAt { get; set; }
    public bool IsClosed { get; set; }
    public DateTime? ClosedAt { get; set; }
    public List<CashRegisterTransactionDto> RecentTransactions { get; set; } = new();
}

public class CashFlowReportDto
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal TotalIn { get; set; }
    public decimal TotalOut { get; set; }
    public decimal ClosingBalance { get; set; }
    public List<TransactionTypeBreakdownDto> Breakdown { get; set; } = new();
}
```

---

## 3. Business Logic

### 3.1 Auto-Create Transactions

```csharp
// When shift closes, create Sales transaction
public async Task OnShiftClosedAsync(Shift shift)
{
    var cashRegister = await _cashRegisterRepository.GetForBranchAsync(shift.BranchId);
    
    if (cashRegister != null && shift.TotalCash > 0)
    {
        var transaction = new CashRegisterTransaction
        {
            CashRegisterId = cashRegister.Id,
            TenantId = shift.TenantId,
            BranchId = shift.BranchId,
            Type = CashRegisterTransactionType.Sales,
            Amount = shift.TotalCash,
            Description = $"Sales from Shift {shift.Id}",
            ReferenceType = "Shift",
            ReferenceId = shift.Id,
            UserId = shift.UserId,
            UserName = shift.User.Name
        };
        
        await _transactionRepository.CreateAsync(transaction);
        
        cashRegister.CurrentBalance += shift.TotalCash;
        await _cashRegisterRepository.UpdateAsync(cashRegister);
    }
}

// When expense is paid, create Expenses transaction
public async Task OnExpensePaidAsync(Expense expense)
{
    var cashRegister = await _cashRegisterRepository.GetForBranchAsync(expense.BranchId);
    
    if (cashRegister != null && expense.PaymentMethod == PaymentMethod.Cash)
    {
        var transaction = new CashRegisterTransaction
        {
            CashRegisterId = cashRegister.Id,
            TenantId = expense.TenantId,
            BranchId = expense.BranchId,
            Type = CashRegisterTransactionType.Expenses,
            Amount = -expense.Amount, // Negative = money out
            Description = $"Expense: {expense.Description}",
            ReferenceType = "Expense",
            ReferenceId = expense.Id,
            UserId = expense.CreatedByUserId,
            UserName = expense.CreatedByUserName
        };
        
        await _transactionRepository.CreateAsync(transaction);
        
        cashRegister.CurrentBalance -= expense.Amount;
        await _cashRegisterRepository.UpdateAsync(cashRegister);
    }
}
```

### 3.2 Reconciliation Logic

```csharp
public async Task<ApiResponse<CashRegisterReconciliation>> ReconcileAsync(
    int cashRegisterId, 
    ReconcileCashRegisterRequest request)
{
    var cashRegister = await _cashRegisterRepository.GetByIdAsync(cashRegisterId);
    
    var reconciliation = new CashRegisterReconciliation
    {
        CashRegisterId = cashRegisterId,
        TenantId = cashRegister.TenantId,
        BranchId = cashRegister.BranchId ?? 0,
        ReconciliationDate = DateTime.UtcNow,
        ExpectedBalance = cashRegister.CurrentBalance,
        ActualBalance = request.ActualBalance,
        Difference = request.ActualBalance - cashRegister.CurrentBalance,
        DifferencePercentage = cashRegister.CurrentBalance != 0
            ? Math.Abs((request.ActualBalance - cashRegister.CurrentBalance) / cashRegister.CurrentBalance * 100)
            : 0,
        Notes = request.Notes,
        ReconciledByUserId = _currentUserService.UserId,
        ReconciledByUserName = _currentUserService.UserName
    };
    
    await _reconciliationRepository.CreateAsync(reconciliation);
    
    // Alert if difference > 5%
    if (reconciliation.DifferencePercentage > 5)
    {
        await _notificationService.NotifyLargeCashDifferenceAsync(reconciliation);
    }
    
    return ApiResponse<CashRegisterReconciliation>.Success(reconciliation);
}
```

---

## 4. Frontend Types

```typescript
// client/src/types/cashRegister.ts

export type CashRegisterTransactionType = 
  | 'Sales' 
  | 'Refunds' 
  | 'Expenses' 
  | 'BankDeposits' 
  | 'Withdrawals' 
  | 'Transfers' 
  | 'Other';

export interface CashRegister {
  id: number;
  name: string;
  branchId?: number;
  branchName?: string;
  openingBalance: number;
  currentBalance: number;
  openedAt: string;
  isClosed: boolean;
  closedAt?: string;
  recentTransactions: CashRegisterTransaction[];
}

export interface CashRegisterTransaction {
  id: number;
  type: CashRegisterTransactionType;
  amount: number;
  description: string;
  referenceType?: string;
  referenceId?: number;
  notes?: string;
  userName: string;
  createdAt: string;
}

export interface CashFlowReport {
  fromDate: string;
  toDate: string;
  openingBalance: number;
  totalIn: number;
  totalOut: number;
  closingBalance: number;
  breakdown: TransactionTypeBreakdown[];
}
```

---


# الميزة 7: المصروفات (Expenses)

## 1. Database Schema

### 1.1 New Entities

#### ExpenseCategory Entity

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class ExpenseCategory : BaseEntity
{
    public int TenantId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Description { get; set; }
    
    /// <summary>
    /// Color for reports/charts (hex code)
    /// </summary>
    public string Color { get; set; } = "#6B7280";
    
    public bool IsActive { get; set; } = true;
    
    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<ExpenseBudget> Budgets { get; set; } = new List<ExpenseBudget>();
}
```

#### Expense Entity

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;
using KasserPro.Domain.Enums;

public class Expense : BaseEntity
{
    public int TenantId { get; set; }
    public int BranchId { get; set; }
    public int CategoryId { get; set; }
    
    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; } = DateTime.UtcNow;
    public string Description { get; set; } = string.Empty;
    
    public ExpenseStatus Status { get; set; } = ExpenseStatus.Pending;
    
    /// <summary>
    /// Payment method (Cash, Bank, Card, Check)
    /// </summary>
    public PaymentMethod PaymentMethod { get; set; }
    
    /// <summary>
    /// Reference number (check number, transfer ID, etc.)
    /// </summary>
    public string? ReferenceNumber { get; set; }
    
    /// <summary>
    /// Optional supplier link
    /// </summary>
    public int? SupplierId { get; set; }
    
    /// <summary>
    /// Optional purchase invoice link
    /// </summary>
    public int? PurchaseInvoiceId { get; set; }
    
    /// <summary>
    /// Is this a recurring expense?
    /// </summary>
    public bool IsRecurring { get; set; } = false;
    
    /// <summary>
    /// Recurrence pattern
    /// </summary>
    public ExpenseRecurrence? Recurrence { get; set; }
    
    /// <summary>
    /// Next occurrence date (for recurring expenses)
    /// </summary>
    public DateTime? NextOccurrence { get; set; }
    
    public string? Notes { get; set; }
    
    /// <summary>
    /// User who created the expense
    /// </summary>
    public int CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    
    /// <summary>
    /// User who approved the expense (Admin only)
    /// </summary>
    public int? ApprovedByUserId { get; set; }
    public string? ApprovedByUserName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    
    /// <summary>
    /// User who marked as paid
    /// </summary>
    public int? PaidByUserId { get; set; }
    public string? PaidByUserName { get; set; }
    public DateTime? PaidAt { get; set; }
    
    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public Branch Branch { get; set; } = null!;
    public ExpenseCategory Category { get; set; } = null!;
    public Supplier? Supplier { get; set; }
    public PurchaseInvoice? PurchaseInvoice { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public User? ApprovedByUser { get; set; }
}
```

#### ExpenseBudget Entity

```csharp
namespace KasserPro.Domain.Entities;

using KasserPro.Domain.Common;

public class ExpenseBudget : BaseEntity
{
    public int TenantId { get; set; }
    
    /// <summary>
    /// null = all branches
    /// </summary>
    public int? BranchId { get; set; }
    
    public int CategoryId { get; set; }
    
    public int Year { get; set; }
    public int Month { get; set; }
    
    /// <summary>
    /// Planned budget amount
    /// </summary>
    public decimal PlannedAmount { get; set; }
    
    /// <summary>
    /// Actual spent amount (calculated)
    /// </summary>
    public decimal ActualAmount { get; set; }
    
    /// <summary>
    /// Percentage used (ActualAmount / PlannedAmount * 100)
    /// </summary>
    public decimal PercentageUsed { get; set; }
    
    public string? Notes { get; set; }
    
    // Navigation
    public Tenant Tenant { get; set; } = null!;
    public Branch? Branch { get; set; }
    public ExpenseCategory Category { get; set; } = null!;
}
```

### 1.2 New Enums

```csharp
namespace KasserPro.Domain.Enums;

public enum ExpenseStatus
{
    /// <summary>
    /// Expense created, waiting for approval
    /// </summary>
    Pending = 0,
    
    /// <summary>
    /// Expense approved by Admin
    /// </summary>
    Approved = 1,
    
    /// <summary>
    /// Expense paid
    /// </summary>
    Paid = 2,
    
    /// <summary>
    /// Expense cancelled
    /// </summary>
    Cancelled = 3
}

public enum ExpenseRecurrence
{
    None = 0,
    Daily = 1,
    Weekly = 2,
    Monthly = 3,
    Yearly = 4
}
```

### 1.3 Modified Entities

#### Tenant Entity - Add Approval Threshold

```csharp
// Add to existing Tenant entity:

/// <summary>
/// Expenses above this amount require Admin approval
/// Default: 1000 EGP
/// </summary>
public decimal ExpenseApprovalThreshold { get; set; } = 1000;
```

---

## 2. API Contracts

### 2.1 Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/expenses` | Admin | Get all expenses (paginated) |
| GET | `/api/expenses/{id}` | Admin | Get expense by ID |
| POST | `/api/expenses` | Admin | Create expense |
| PUT | `/api/expenses/{id}` | Admin | Update expense (Pending only) |
| DELETE | `/api/expenses/{id}` | Admin | Delete expense (Pending only) |
| POST | `/api/expenses/{id}/approve` | Admin | Approve expense |
| POST | `/api/expenses/{id}/pay` | Admin | Mark as paid |
| POST | `/api/expenses/{id}/cancel` | Admin | Cancel expense |
| GET | `/api/expense-categories` | Admin | Get all categories |
| POST | `/api/expense-categories` | Admin | Create category |
| PUT | `/api/expense-categories/{id}` | Admin | Update category |
| DELETE | `/api/expense-categories/{id}` | Admin | Delete category |
| GET | `/api/expense-budgets` | Admin | Get budgets |
| POST | `/api/expense-budgets` | Admin | Set budget |
| GET | `/api/expenses/reports/by-category` | Admin | Expenses by category report |
| GET | `/api/expenses/reports/vs-revenue` | Admin | Expenses vs revenue report |
| GET | `/api/expenses/reports/trends` | Admin | Expense trends report |

### 2.2 Request DTOs

```csharp
namespace KasserPro.Application.DTOs.Expenses;

public class CreateExpenseRequest
{
    public int CategoryId { get; set; }
    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; } = DateTime.UtcNow;
    public string Description { get; set; } = string.Empty;
    public PaymentMethod PaymentMethod { get; set; }
    public string? ReferenceNumber { get; set; }
    public int? SupplierId { get; set; }
    public int? PurchaseInvoiceId { get; set; }
    public bool IsRecurring { get; set; } = false;
    public ExpenseRecurrence? Recurrence { get; set; }
    public string? Notes { get; set; }
}

public class CreateExpenseCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Description { get; set; }
    public string Color { get; set; } = "#6B7280";
}

public class SetBudgetRequest
{
    public int? BranchId { get; set; }
    public int CategoryId { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal PlannedAmount { get; set; }
    public string? Notes { get; set; }
}
```

### 2.3 Response DTOs

```csharp
namespace KasserPro.Application.DTOs.Expenses;

public class ExpenseDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryColor { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? ReferenceNumber { get; set; }
    public int? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public bool IsRecurring { get; set; }
    public string? Recurrence { get; set; }
    public DateTime? NextOccurrence { get; set; }
    public string? Notes { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? ApprovedByUserName { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? PaidByUserName { get; set; }
    public DateTime? PaidAt { get; set; }
}

public class ExpenseBudgetDto
{
    public int Id { get; set; }
    public int? BranchId { get; set; }
    public string? BranchName { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal PlannedAmount { get; set; }
    public decimal ActualAmount { get; set; }
    public decimal PercentageUsed { get; set; }
    public decimal Remaining { get; set; }
    public bool IsOverBudget { get; set; }
    public string? Notes { get; set; }
}

public class ExpensesByCategoryReportDto
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public decimal TotalExpenses { get; set; }
    public List<CategoryBreakdownDto> Categories { get; set; } = new();
}

public class CategoryBreakdownDto
{
    public string CategoryName { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}
```

---

## 3. Business Logic

### 3.1 Service Methods

```csharp
namespace KasserPro.Application.Services;

public interface IExpenseService
{
    Task<ApiResponse<PaginatedResponse<ExpenseDto>>> GetAllAsync(
        int? categoryId = null,
        ExpenseStatus? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int pageNumber = 1,
        int pageSize = 20);
    
    Task<ApiResponse<ExpenseDto>> GetByIdAsync(int id);
    
    Task<ApiResponse<ExpenseDto>> CreateAsync(CreateExpenseRequest request);
    
    Task<ApiResponse<ExpenseDto>> ApproveAsync(int id);
    
    Task<ApiResponse<ExpenseDto>> MarkAsPaidAsync(int id);
    
    Task<ApiResponse<ExpenseDto>> CancelAsync(int id, string reason);
    
    // Recurring expenses
    Task ProcessRecurringExpensesAsync();
    
    // Reports
    Task<ApiResponse<ExpensesByCategoryReportDto>> GetExpensesByCategoryAsync(
        DateTime fromDate, 
        DateTime toDate);
    
    Task<ApiResponse<ExpensesVsRevenueReportDto>> GetExpensesVsRevenueAsync(
        DateTime fromDate, 
        DateTime toDate);
}
```

### 3.2 Business Rules

#### Rule 1: Auto-Approval Logic

```csharp
public async Task<ApiResponse<ExpenseDto>> CreateAsync(CreateExpenseRequest request)
{
    await using var transaction = await _unitOfWork.BeginTransactionAsync();
    try
    {
        var tenant = await _tenantRepository.GetByIdAsync(_currentUserService.TenantId);
        
        var expense = new Expense
        {
            TenantId = _currentUserService.TenantId,
            BranchId = _currentUserService.BranchId,
            CategoryId = request.CategoryId,
            Amount = request.Amount,
            ExpenseDate = request.ExpenseDate,
            Description = request.Description,
            PaymentMethod = request.PaymentMethod,
            ReferenceNumber = request.ReferenceNumber,
            SupplierId = request.SupplierId,
            PurchaseInvoiceId = request.PurchaseInvoiceId,
            IsRecurring = request.IsRecurring,
            Recurrence = request.Recurrence,
            Notes = request.Notes,
            CreatedByUserId = _currentUserService.UserId,
            CreatedByUserName = _currentUserService.UserName
        };
        
        // Auto-approve if below threshold
        if (expense.Amount < tenant.ExpenseApprovalThreshold)
        {
            expense.Status = ExpenseStatus.Approved;
            expense.ApprovedByUserId = _currentUserService.UserId;
            expense.ApprovedByUserName = "Auto-Approved";
            expense.ApprovedAt = DateTime.UtcNow;
        }
        else
        {
            expense.Status = ExpenseStatus.Pending;
        }
        
        // Calculate next occurrence for recurring expenses
        if (expense.IsRecurring && expense.Recurrence.HasValue)
        {
            expense.NextOccurrence = CalculateNextOccurrence(
                expense.ExpenseDate, 
                expense.Recurrence.Value);
        }
        
        await _expenseRepository.CreateAsync(expense);
        
        // Update budget
        await UpdateBudgetAsync(expense);
        
        await transaction.CommitAsync();
        
        return ApiResponse<ExpenseDto>.Success(_mapper.Map<ExpenseDto>(expense));
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}

private DateTime CalculateNextOccurrence(DateTime current, ExpenseRecurrence recurrence)
{
    return recurrence switch
    {
        ExpenseRecurrence.Daily => current.AddDays(1),
        ExpenseRecurrence.Weekly => current.AddDays(7),
        ExpenseRecurrence.Monthly => current.AddMonths(1),
        ExpenseRecurrence.Yearly => current.AddYears(1),
        _ => current
    };
}
```

#### Rule 2: Budget Tracking

```csharp
private async Task UpdateBudgetAsync(Expense expense)
{
    var budget = await _budgetRepository.GetBudgetAsync(
        expense.TenantId,
        expense.BranchId,
        expense.CategoryId,
        expense.ExpenseDate.Year,
        expense.ExpenseDate.Month);
    
    if (budget != null)
    {
        budget.ActualAmount += expense.Amount;
        budget.PercentageUsed = budget.PlannedAmount > 0
            ? (budget.ActualAmount / budget.PlannedAmount * 100)
            : 0;
        
        await _budgetRepository.UpdateAsync(budget);
        
        // Alert if > 80%
        if (budget.PercentageUsed >= 80)
        {
            await _notificationService.NotifyBudgetThresholdAsync(budget);
        }
    }
}
```

#### Rule 3: Recurring Expense Processing (Background Job)

```csharp
// Run daily via background job
public async Task ProcessRecurringExpensesAsync()
{
    var today = DateTime.UtcNow.Date;
    
    var dueExpenses = await _expenseRepository
        .GetRecurringExpensesDueAsync(today);
    
    foreach (var expense in dueExpenses)
    {
        // Create new expense instance
        var newExpense = new Expense
        {
            TenantId = expense.TenantId,
            BranchId = expense.BranchId,
            CategoryId = expense.CategoryId,
            Amount = expense.Amount,
            ExpenseDate = today,
            Description = $"{expense.Description} (Recurring)",
            Status = expense.Amount < expense.Tenant.ExpenseApprovalThreshold
                ? ExpenseStatus.Approved
                : ExpenseStatus.Pending,
            PaymentMethod = expense.PaymentMethod,
            SupplierId = expense.SupplierId,
            IsRecurring = false, // New instance is not recurring
            CreatedByUserId = expense.CreatedByUserId,
            CreatedByUserName = "System (Recurring)"
        };
        
        await _expenseRepository.CreateAsync(newExpense);
        
        // Update next occurrence
        expense.NextOccurrence = CalculateNextOccurrence(today, expense.Recurrence!.Value);
        await _expenseRepository.UpdateAsync(expense);
    }
}
```

---

## 4. Frontend Types

```typescript
// client/src/types/expense.ts

export type ExpenseStatus = 'Pending' | 'Approved' | 'Paid' | 'Cancelled';
export type ExpenseRecurrence = 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export interface Expense {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  amount: number;
  expenseDate: string;
  description: string;
  status: ExpenseStatus;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  supplierId?: number;
  supplierName?: string;
  isRecurring: boolean;
  recurrence?: ExpenseRecurrence;
  nextOccurrence?: string;
  notes?: string;
  createdByUserName: string;
  createdAt: string;
  approvedByUserName?: string;
  approvedAt?: string;
  paidByUserName?: string;
  paidAt?: string;
}

export interface ExpenseBudget {
  id: number;
  branchId?: number;
  branchName?: string;
  categoryId: number;
  categoryName: string;
  year: number;
  month: number;
  plannedAmount: number;
  actualAmount: number;
  percentageUsed: number;
  remaining: number;
  isOverBudget: boolean;
  notes?: string;
}
```

---

## 5. Testing Strategy

### 5.1 Unit Tests

```csharp
[Fact]
public async Task CreateExpense_BelowThreshold_AutoApproved()
{
    // Test auto-approval logic
}

[Fact]
public async Task ProcessRecurringExpenses_CreatesNewInstances()
{
    // Test recurring expense generation
}

[Fact]
public async Task UpdateBudget_Over80Percent_SendsAlert()
{
    // Test budget alert
}
```

---

# خاتمة التصميم

## ملخص الميزات

تم تصميم 7 ميزات رئيسية:

1. ✅ **فواتير الشراء** - نظام شامل مع علاقة المورد بالمنتج
2. ✅ **تحسينات الورديات** - Handover, Force Close, Recovery
3. ✅ **المخزون متعدد الفروع** - مخزون منفصل + أسعار مختلفة + نقل
4. ✅ **التكامل مع الأجهزة** - طابعات حرارية + ماسحات باركود
5. ✅ **بيانات الاختبار** - Seeders واقعية + سيناريوهات متعددة
6. ✅ **الخزينة** - تتبع شامل للنقد + تسوية + تقارير
7. ✅ **المصروفات** - فئات + موافقات + ميزانيات + تكرار

## الالتزام بالمعمارية

- ✅ Clean Architecture (Domain → Application → Infrastructure → API)
- ✅ Multi-Tenancy (TenantId + BranchId في كل Entity)
- ✅ Tax Exclusive Model (NetTotal + TaxAmount = Total)
- ✅ Audit Trail (تسجيل كل العمليات)
- ✅ Transaction Boundaries (كل عملية مالية في Transaction)
- ✅ Type Safety (Enums بدلاً من Magic Strings)
- ✅ Frontend Types = Backend DTOs (100% match)

## الخطوات التالية

1. مراجعة التصميم مع المستخدم
2. إنشاء ملف tasks.md (خطة التنفيذ)
3. البدء في التنفيذ حسب الأولويات

---

**تاريخ الإنشاء**: 27 يناير 2026  
**الحالة**: جاهز للمراجعة ✅

