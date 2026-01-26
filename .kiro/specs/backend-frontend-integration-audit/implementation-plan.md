# 📋 خطة التنفيذ - Backend-Frontend Integration Fixes
## KasserPro Implementation Plan

**تاريخ الإعداد:** 26 يناير 2026  
**الإصدار:** 1.0  
**المدة الإجمالية المقدرة:** 15-22 يوم عمل

---

## 📊 ملخص المهام

| المرحلة | عدد المهام | المدة المقدرة | الأولوية |
|---------|------------|----------------|----------|
| Phase 1: Critical | 1 | 5-7 أيام | 🔴 |
| Phase 2: Important | 6 | 6-9 أيام | 🟡 |
| Phase 3: Nice to Have | 5 | 3-5 أيام | 🟢 |
| **الإجمالي** | **12** | **14-21 يوم** | - |

> **ملاحظة:** تم تحديث هذا الملخص بناءً على تقرير التحقق - تم حذف المهام الخاطئة (26 يناير 2026)

---

## 🔴 Phase 1: Critical Fixes (الأولوية القصوى)

### Task 1.1: Implement Suppliers Feature

**الأولوية:** 🔴 Critical  
**المدة المقدرة:** 5-7 أيام (Large)  
**Dependencies:** لا يوجد

#### الوصف
تنفيذ ميزة إدارة الموردين بالكامل من الصفر (Backend + Frontend + Tests)

#### Backend Tasks

**1.1.1 Create Supplier Entity**
```csharp
// File: src/KasserPro.Domain/Entities/Supplier.cs
public class Supplier : BaseEntity
{
    public int TenantId { get; set; }
    public int BranchId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? TaxNumber { get; set; }
    public string? ContactPerson { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
```


**1.1.2 Create DTOs**
```csharp
// File: src/KasserPro.Application/DTOs/Suppliers/SupplierDto.cs
public class SupplierDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? TaxNumber { get; set; }
    public string? ContactPerson { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSupplierRequest
{
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? TaxNumber { get; set; }
    public string? ContactPerson { get; set; }
    public string? Notes { get; set; }
}

public class UpdateSupplierRequest
{
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? TaxNumber { get; set; }
    public string? ContactPerson { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
}
```


**1.1.3 Create Service Interface & Implementation**
```csharp
// File: src/KasserPro.Application/Services/Interfaces/ISupplierService.cs
public interface ISupplierService
{
    Task<ApiResponse<List<SupplierDto>>> GetAllAsync();
    Task<ApiResponse<SupplierDto>> GetByIdAsync(int id);
    Task<ApiResponse<SupplierDto>> CreateAsync(CreateSupplierRequest request);
    Task<ApiResponse<SupplierDto>> UpdateAsync(int id, UpdateSupplierRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}

// File: src/KasserPro.Application/Services/Implementations/SupplierService.cs
// Implementation with validation, multi-tenancy, audit logging
```

**1.1.4 Create Controller**
```csharp
// File: src/KasserPro.API/Controllers/SuppliersController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SuppliersController : ControllerBase
{
    private readonly ISupplierService _supplierService;

    [HttpGet]
    public async Task<IActionResult> GetAll() { }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id) { }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateSupplierRequest request) { }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSupplierRequest request) { }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id) { }
}
```

**1.1.5 Create Migration**
```bash
cd src/KasserPro.Infrastructure
dotnet ef migrations add AddSuppliers --startup-project ../KasserPro.API
```


#### Frontend Tasks

**1.1.6 Create Types**
```typescript
// File: client/src/types/supplier.types.ts
export interface Supplier {
  id: number;
  name: string;
  nameEn?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  contactPerson?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  nameEn?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  contactPerson?: string;
  notes?: string;
}

export interface UpdateSupplierRequest extends CreateSupplierRequest {
  isActive: boolean;
}
```

**1.1.7 Create API File**
```typescript
// File: client/src/api/suppliersApi.ts
import { baseApi } from "./baseApi";
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from "../types/supplier.types";
import { ApiResponse } from "../types/api.types";

export const suppliersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<ApiResponse<Supplier[]>, void>({ /* ... */ }),
    getSupplier: builder.query<ApiResponse<Supplier>, number>({ /* ... */ }),
    createSupplier: builder.mutation<ApiResponse<Supplier>, CreateSupplierRequest>({ /* ... */ }),
    updateSupplier: builder.mutation<ApiResponse<Supplier>, { id: number; data: UpdateSupplierRequest }>({ /* ... */ }),
    deleteSupplier: builder.mutation<ApiResponse<boolean>, number>({ /* ... */ }),
  }),
});
```


**1.1.8 Create Suppliers Page**
```typescript
// File: client/src/pages/suppliers/SuppliersPage.tsx
// - Table with suppliers list
// - Add/Edit/Delete buttons
// - Search and filters
// - Pagination
```

**1.1.9 Create Supplier Form Modal**
```typescript
// File: client/src/components/suppliers/SupplierFormModal.tsx
// - Form with all supplier fields
// - Validation
// - Create/Update modes
```

**1.1.10 Add to Navigation**
```typescript
// File: client/src/App.tsx or Navigation component
// Add Suppliers link (Admin only)
```

#### Testing Tasks

**1.1.11 Integration Tests**
```csharp
// File: src/KasserPro.Tests/Integration/SupplierTests.cs
// - Test CRUD operations
// - Test validation
// - Test multi-tenancy
```

**1.1.12 E2E Tests**
```typescript
// File: client/e2e/suppliers.spec.ts
// - Test create supplier
// - Test edit supplier
// - Test delete supplier
// - Test search/filter
```

#### Acceptance Criteria

- [ ] Backend: Supplier Entity created with migration
- [ ] Backend: CRUD endpoints working
- [ ] Backend: Multi-tenancy enforced
- [ ] Backend: Audit logging enabled
- [ ] Frontend: Types match Backend DTOs
- [ ] Frontend: All CRUD operations work
- [ ] Frontend: Search and filters implemented
- [ ] Frontend: Validation working
- [ ] Tests: Integration tests pass
- [ ] Tests: E2E tests pass
- [ ] Documentation: API docs updated


---

## 🟡 Phase 2: Important Improvements

### Task 2.1: Add Filters to Categories Page

**الأولوية:** 🟡 Important  
**المدة المقدرة:** 2-3 ساعات (Small)  
**Dependencies:** لا يوجد

#### Backend Changes

**2.1.1 Update CategoriesController**
```csharp
[HttpGet]
public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
{
    var result = await _categoryService.GetAllAsync(search, page, pageSize);
    return Ok(result);
}
```

**2.1.2 Update CategoryService**
- Add search and pagination logic
- Filter by name (Arabic or English)

#### Frontend Changes

**2.1.3 Update CategoriesPage**
```typescript
// Add search input
// Add pagination controls
// Update API call to pass search param
```

#### Acceptance Criteria
- [ ] Backend accepts search parameter
- [ ] Backend returns paginated results
- [ ] Frontend has search input
- [ ] Frontend has pagination UI
- [ ] Search works in real-time

---

### Task 2.2: Add Filters to Orders Page

**الأولوية:** 🟡 Important  
**المدة المقدرة:** 4-5 ساعات (Medium)  
**Dependencies:** لا يوجد

#### Backend Changes

**2.2.1 Update OrdersController**
```csharp
[HttpGet]
public async Task<IActionResult> GetAllOrders(
    [FromQuery] string? status,
    [FromQuery] DateTime? fromDate,
    [FromQuery] DateTime? toDate,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20)
{
    var result = await _orderService.GetAllAsync(status, fromDate, toDate, page, pageSize);
    return Ok(result);
}
```


**2.2.2 Update OrderService**
- Add filtering logic
- Support status filter (Completed, Cancelled, etc.)
- Support date range filter
- Add pagination

#### Frontend Changes

**2.2.3 Update OrdersPage**
```typescript
// Add status dropdown filter
// Add date range picker (from/to)
// Add pagination controls
// Update ordersApi to accept filters
```

**2.2.4 Update ordersApi.ts**
```typescript
getOrders: builder.query<ApiResponse<PagedOrders>, OrdersQueryParams>({
  query: (params) => ({
    url: "/orders",
    params: {
      status: params?.status,
      fromDate: params?.fromDate,
      toDate: params?.toDate,
      page: params?.page || 1,
      pageSize: params?.pageSize || 20,
    },
  }),
}),
```

#### Acceptance Criteria
- [ ] Backend filters by status
- [ ] Backend filters by date range
- [ ] Backend returns paginated results
- [ ] Frontend has status dropdown
- [ ] Frontend has date pickers
- [ ] Frontend has pagination
- [ ] Filters work correctly

---

### Task 2.3: Complete Loyalty Points UI

> **ملاحظة:** تم حذف Task 2.3 الأصلي (Implement Customers Search) لأنه موجود بالفعل في CustomersPage.tsx (26 يناير 2026)

**الأولوية:** 🟡 Important  
**المدة المقدرة:** 4-5 ساعات (Medium)  
**Dependencies:** لا يوجد

#### Frontend Changes

**2.3.1 Update CustomerDetailsModal**
```typescript
// ✅ Loyalty Points display already exists (lines 127-129)
// ➕ Add "Add Points" button
// ➕ Add "Redeem Points" button
```

**2.3.2 Create LoyaltyPointsModal**
```typescript
// Modal for adding/redeeming points
// Input for points amount
// Reason/notes field (optional)
// Validation (points > 0, sufficient balance for redeem)
```

**2.4.3 Add Loyalty History (Optional)**
```typescript
// Show history of points transactions
// Date, amount, type (earned/redeemed), reason
```

#### Acceptance Criteria
- [ ] ✅ Loyalty points display verified (already exists)
- [ ] Add points button works
- [ ] Redeem points button works
- [ ] Validation prevents invalid operations
- [ ] Success/error messages shown
- [ ] Customer data refreshes after operation

---

### Task 2.4: Create Branches Management Page

> **ملاحظة:** تم إعادة ترقيم المهام بعد حذف Task 2.3 الأصلي (26 يناير 2026)

**الأولوية:** 🟡 Important  
**المدة المقدرة:** 6-8 ساعات (Medium)  
**Dependencies:** لا يوجد

#### Frontend Changes

**2.5.1 Create BranchesPage**
```typescript
// File: client/src/pages/branches/BranchesPage.tsx
// - Table with branches list
// - Add/Edit/Delete buttons (Admin only)
// - Display: Name, Code, Address, Phone, Status
```

**2.5.2 Create BranchFormModal**
```typescript
// File: client/src/components/branches/BranchFormModal.tsx
// - Form with all branch fields
// - Validation (name, code required)
// - Create/Update modes
```

**2.5.3 Add to Navigation**
```typescript
// Add Branches link in Settings section
// Admin only access
```

#### Acceptance Criteria
- [ ] Branches page created
- [ ] CRUD operations work
- [ ] Only Admin can access
- [ ] Validation working
- [ ] Success/error messages shown


---

### Task 2.5: Add Advanced Filters to Products

> **ملاحظة:** تم حذف Task 2.6 الأصلي (Add Pagination to Customer Orders) لأنه موجود بالفعل في CustomerDetailsModal.tsx (26 يناير 2026)

**الأولوية:** 🟡 Important  
**المدة المقدرة:** 3-4 ساعات (Small)  
**Dependencies:** لا يوجد

#### Backend Changes

**2.7.1 Update ProductsController**
```csharp
[HttpGet]
public async Task<IActionResult> GetAll(
    [FromQuery] int? categoryId,
    [FromQuery] string? search,
    [FromQuery] bool? isActive,
    [FromQuery] bool? lowStock)
{
    var result = await _productService.GetAllAsync(categoryId, search, isActive, lowStock);
    return Ok(result);
}
```

#### Frontend Changes

**2.7.2 Update ProductsPage**
```typescript
// Add "Active Only" checkbox filter
// Add "Low Stock Only" checkbox filter
// Add sorting dropdown (Name, Price, Stock)
```

#### Acceptance Criteria
- [ ] Backend accepts new filters
- [ ] Frontend has filter UI
- [ ] Filters work correctly
- [ ] Can combine multiple filters


---

### Task 2.6: Improve API Error Handling

> **ملاحظة:** مهمة جديدة تم اكتشافها أثناء التحقق (26 يناير 2026)

**الأولوية:** 🟡 Important  
**المدة المقدرة:** 4-5 ساعات (Medium)  
**Dependencies:** لا يوجد

#### Frontend Changes

**2.6.1 Add Error Boundaries**
```typescript
// Create ErrorBoundary component
// Wrap main routes with error boundaries
// Add fallback UI for errors
```

**2.6.2 Add Retry Mechanisms**
```typescript
// Add retry logic to failed API calls
// Show retry button in error states
// Implement exponential backoff
```

**2.6.3 Improve Error Messages**
```typescript
// Map API error codes to user-friendly messages
// Show specific error details when available
// Add error logging for debugging
```

#### Acceptance Criteria
- [ ] Error boundaries implemented
- [ ] Retry mechanism works
- [ ] User-friendly error messages shown
- [ ] No unhandled promise rejections

---

## 🟢 Phase 3: Nice to Have Improvements

### Task 3.1: Optimize Client-Side Filtering

> **ملاحظة:** مهمة جديدة تم اكتشافها أثناء التحقق (26 يناير 2026)

**الأولوية:** 🟢 Nice to have  
**المدة المقدرة:** 3-4 ساعات (Small)  
**Dependencies:** لا يوجد

#### Changes

**3.1.1 Add Server-Side Filtering for Large Catalogs**
```typescript
// Detect catalog size (> 500 products)
// Switch to server-side filtering automatically
// Add loading states during filtering
```

#### Acceptance Criteria
- [ ] Server-side filtering for large catalogs
- [ ] Performance improved for 500+ products
- [ ] No breaking changes to existing functionality

---

### Task 3.2: Clean Up Unused Endpoints

**الأولوية:** 🟢 Nice to have  
**المدة المقدرة:** 30 دقيقة (Tiny)  
**Dependencies:** لا يوجد

#### Changes

**3.1.1 Products Endpoint Cleanup**

Option A: Remove `/products/category/{categoryId}` endpoint
```csharp
// Delete this method from ProductsController
[HttpGet("category/{categoryId}")]
public async Task<IActionResult> GetByCategory(int categoryId) { }
```

Option B: Update Frontend to use it
```typescript
// Update productsApi.ts
getProductsByCategory: builder.query<ApiResponse<Product[]>, number>({
  query: (categoryId) => `/products/category/${categoryId}`, // Use route param
}),
```

**Recommendation:** Option A (remove endpoint) - query param is more flexible

**3.1.2 Payments Endpoint Review**
```csharp
// Keep or remove GET /payments/order/{orderId}
// Currently unused but might be useful for future reports
```

**Recommendation:** Keep for future use, document as "Future Use"

#### Acceptance Criteria
- [ ] Decision made on each endpoint
- [ ] Unused endpoints removed or documented
- [ ] API documentation updated

---

### Task 3.3: Display Unused Product Properties

**الأولوية:** 🟢 Nice to have  
**المدة المقدرة:** 1 ساعة (Tiny)  
**Dependencies:** لا يوجد

#### Frontend Changes

**3.3.1 Update Product Details Display**
```typescript
// Show ReorderPoint in product card/details
// Show LastStockUpdate in inventory section
// Format dates nicely
```

#### Acceptance Criteria
- [ ] ReorderPoint displayed
- [ ] LastStockUpdate displayed
- [ ] Formatting is user-friendly


---

### Task 3.4: Display Refund Details

**الأولوية:** 🟢 Nice to have  
**المدة المقدرة:** 1-2 ساعات (Small)  
**Dependencies:** لا يوجد

#### Frontend Changes

**3.4.1 Update OrderDetailsModal**
```typescript
// Add Refund Information section (if order is refunded)
// Display:
// - Refunded At (date/time)
// - Refund Reason
// - Refund Amount
// - Refunded By (user name)
```

#### Acceptance Criteria
- [ ] Refund section shows for refunded orders
- [ ] All refund details displayed
- [ ] Formatting is clear

---

### Task 3.5: Improve Error Handling (Error Codes)

> **ملاحظة:** تم دمج هذه المهمة مع Task 2.6 (26 يناير 2026) - يمكن حذفها أو الاحتفاظ بها كمهمة منفصلة للـ Error Codes فقط

**الأولوية:** 🟢 Nice to have  
**المدة المقدرة:** 3-4 ساعات (Small)  
**Dependencies:** لا يوجد

#### Frontend Changes

**3.5.1 Create Error Codes Constants**
```typescript
// File: client/src/utils/errorCodes.ts
export const ERROR_CODES = {
  NO_OPEN_SHIFT: 'NO_OPEN_SHIFT',
  PRODUCT_INACTIVE: 'PRODUCT_INACTIVE',
  ORDER_EMPTY: 'ORDER_EMPTY',
  // ... all error codes from Backend
};

export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.NO_OPEN_SHIFT]: 'يجب فتح وردية أولاً',
  [ERROR_CODES.PRODUCT_INACTIVE]: 'المنتج غير متاح',
  // ... all messages
};
```

**3.5.2 Update API Error Interceptor**
```typescript
// File: client/src/api/baseApi.ts
// Add error code handling in response interceptor
// Map error codes to user-friendly messages
```

#### Acceptance Criteria
- [ ] Error codes constants created
- [ ] Error messages mapped
- [ ] Interceptor handles error codes
- [ ] User sees friendly messages


---

### Task 3.6: Add Inventory History Pagination

**الأولوية:** 🟢 Nice to have  
**المدة المقدرة:** 1-2 ساعات (Small)  
**Dependencies:** لا يوجد

#### Frontend Changes

**3.6.1 Update Stock History Display**
```typescript
// Add pagination controls
// Use existing page/pageSize parameters
// Show page numbers or "Load More"
```

#### Acceptance Criteria
- [ ] Pagination controls added
- [ ] Page navigation works
- [ ] Shows total count

---

### Task 3.7: Update API Documentation

**الأولوية:** 🟢 Nice to have  
**المدة المقدرة:** 2-3 ساعات (Small)  
**Dependencies:** All previous tasks

#### Documentation Updates

**3.7.1 Add Suppliers Section**
```markdown
## Suppliers

### GET /api/suppliers
### POST /api/suppliers
### PUT /api/suppliers/{id}
### DELETE /api/suppliers/{id}
```

**3.7.2 Update Filters Documentation**
- Document all new filter parameters
- Update query params for each endpoint
- Add examples

**3.7.3 Update Phase Status**
- Mark completed features as ✅
- Update Phase 2 status

#### Acceptance Criteria
- [ ] Suppliers documented
- [ ] Filters documented
- [ ] Examples added
- [ ] Phase status updated


---

## 📅 Execution Timeline

### Week 1: Critical + Important (Part 1)

| Day | Tasks | Hours |
|-----|-------|-------|
| Mon | Task 1.1 (Suppliers) - Backend Entity, DTOs, Service | 8h |
| Tue | Task 1.1 (Suppliers) - Backend Controller, Migration | 8h |
| Wed | Task 1.1 (Suppliers) - Frontend Types, API, Page | 8h |
| Thu | Task 1.1 (Suppliers) - Frontend Components, Tests | 8h |
| Fri | Task 1.1 (Suppliers) - E2E Tests, Documentation | 4h |
| Fri | Task 2.1 (Categories Filters) | 3h |

**Week 1 Total:** 39 hours

### Week 2: Important (Part 2)

| Day | Tasks | Hours |
|-----|-------|-------|
| Mon | Task 2.2 (Orders Filters) | 5h |
| Mon | Task 2.3 (Customers Search) | 3h |
| Tue | Task 2.4 (Loyalty Points UI) | 5h |
| Tue | Task 2.6 (Customer Orders Pagination) | 2h |
| Wed | Task 2.5 (Branches Management Page) | 8h |
| Thu | Task 2.7 (Products Advanced Filters) | 4h |
| Thu | Testing & Bug Fixes | 4h |
| Fri | Buffer for delays | 8h |

**Week 2 Total:** 39 hours

### Week 3: Nice to Have + Polish

| Day | Tasks | Hours |
|-----|-------|-------|
| Mon | Task 3.1 (Clean Up Endpoints) | 1h |
| Mon | Task 3.2 (Product Properties Display) | 1h |
| Mon | Task 3.3 (Refund Details Display) | 2h |
| Mon | Task 3.4 (Error Handling) | 4h |
| Tue | Task 3.5 (Inventory Pagination) | 2h |
| Tue | Task 3.6 (Documentation) | 3h |
| Wed-Fri | Final Testing, Bug Fixes, Polish | 24h |

**Week 3 Total:** 37 hours

**Grand Total:** 115 hours (~15 working days)


---

## 🔗 Task Dependencies

```
Phase 1 (Critical)
└── Task 1.1: Suppliers Feature
    └── No dependencies

Phase 2 (Important)
├── Task 2.1: Categories Filters
│   └── No dependencies
├── Task 2.2: Orders Filters
│   └── No dependencies
├── Task 2.3: Customers Search
│   └── No dependencies
├── Task 2.4: Loyalty Points UI
│   └── No dependencies
├── Task 2.5: Branches Management
│   └── No dependencies
├── Task 2.6: Customer Orders Pagination
│   └── No dependencies
└── Task 2.7: Products Filters
    └── No dependencies

Phase 3 (Nice to Have)
├── Task 3.1: Clean Up Endpoints
│   └── No dependencies
├── Task 3.2: Product Properties
│   └── No dependencies
├── Task 3.3: Refund Details
│   └── No dependencies
├── Task 3.4: Error Handling
│   └── No dependencies
├── Task 3.5: Inventory Pagination
│   └── No dependencies
└── Task 3.6: Documentation
    └── Depends on: All previous tasks
```

**Note:** معظم المهام مستقلة ويمكن تنفيذها بالتوازي إذا كان هناك أكثر من مطور


---

## ✅ Verification Checklist

### Before Starting Each Task

- [ ] Read task description completely
- [ ] Understand acceptance criteria
- [ ] Check dependencies
- [ ] Review related code
- [ ] Create feature branch

### During Implementation

- [ ] Follow architecture rules
- [ ] Write clean, documented code
- [ ] Add validation where needed
- [ ] Handle errors properly
- [ ] Test as you go

### Before Marking Task Complete

- [ ] All acceptance criteria met
- [ ] Code reviewed (self or peer)
- [ ] Unit tests written (if applicable)
- [ ] Integration tests pass
- [ ] E2E tests pass (if applicable)
- [ ] No console errors
- [ ] Documentation updated
- [ ] Commit with clear message
- [ ] Create PR (if using PRs)

### Phase Completion Checklist

#### Phase 1 Complete When:
- [ ] Suppliers feature fully working
- [ ] All CRUD operations tested
- [ ] E2E tests passing
- [ ] Documentation updated

#### Phase 2 Complete When:
- [ ] All filters implemented
- [ ] Loyalty Points UI complete
- [ ] Branches Management working
- [ ] Pagination added where needed
- [ ] All tests passing

#### Phase 3 Complete When:
- [ ] Unused endpoints cleaned
- [ ] All properties displayed
- [ ] Error handling improved
- [ ] Documentation complete
- [ ] Final testing done


---

## 📊 Progress Tracking

### Phase 1: Critical (1/1 tasks)

- [ ] Task 1.1: Suppliers Feature (0%)

**Phase Progress:** 0% (0/1 complete)

### Phase 2: Important (6/6 tasks)

> **ملاحظة:** تم تحديث عدد المهام من 7 إلى 6 بعد حذف المهام الخاطئة (26 يناير 2026)

- [ ] Task 2.1: Categories Filters (0%)
- [ ] Task 2.2: Orders Filters (0%)
- [ ] Task 2.3: Loyalty Points UI (0%)
- [ ] Task 2.4: Branches Management (0%)
- [ ] Task 2.5: Products Filters (0%)
- [ ] Task 2.6: API Error Handling (0%)

**Phase Progress:** 0% (0/6 complete)

### Phase 3: Nice to Have (7/7 tasks)

> **ملاحظة:** تم تحديث عدد المهام من 6 إلى 7 بعد إضافة مهام جديدة (26 يناير 2026)

- [ ] Task 3.1: Client-Side Filtering Optimization (0%)
- [ ] Task 3.2: Clean Up Endpoints (0%)
- [ ] Task 3.3: Product Properties (0%)
- [ ] Task 3.4: Refund Details (0%)
- [ ] Task 3.5: Error Handling (Error Codes) (0%)
- [ ] Task 3.6: Inventory Pagination (0%)
- [ ] Task 3.7: Documentation (0%)

**Phase Progress:** 0% (0/7 complete)

---

## **Overall Progress: 0% (0/14 tasks complete)**

> **ملاحظة:** تم تحديث العدد الإجمالي من 14 إلى 14 مهمة (حذف 2، إضافة 2) (26 يناير 2026)

---

## 🎯 Success Metrics

### Quantitative Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| API Coverage | 78% | 95% | 🔴 |
| Filter Implementation | 40% | 90% | 🔴 |
| Feature Completeness | 85% | 98% | 🟡 |
| Type Safety | 95% | 98% | ✅ |
| Architecture Compliance | 95% | 98% | ✅ |

### Qualitative Metrics

- [ ] All critical features implemented
- [ ] User can filter/search all list pages
- [ ] No unused endpoints (or documented)
- [ ] All response properties utilized
- [ ] Error messages are user-friendly
- [ ] Documentation is up-to-date


---

## 🚀 Getting Started

### Step 1: Review Documents

1. Read this Implementation Plan completely
2. Review the Audit Report for context
3. Check Architecture Rules in `docs/KASSERPRO_ARCHITECTURE_MANIFEST.md`
4. Review API Documentation in `docs/api/API_DOCUMENTATION.md`

### Step 2: Setup Environment

```bash
# Backend
cd src/KasserPro.API
dotnet restore
dotnet build

# Frontend
cd client
npm install
npm run dev

# Run tests to ensure everything works
cd src/KasserPro.Tests
dotnet test

cd client
npm run test:e2e
```

### Step 3: Create Feature Branch

```bash
git checkout -b feature/integration-fixes
# or for specific task:
git checkout -b feature/suppliers-management
```

### Step 4: Start with Phase 1

Begin with Task 1.1 (Suppliers Feature) as it's the most critical.

---

## 📞 Support & Questions

### If You Get Stuck

1. Review the Audit Report for context
2. Check existing similar implementations
3. Review Architecture Rules
4. Ask team members
5. Document blockers

### Common Issues

**Issue:** Migration fails  
**Solution:** Check connection string, ensure database is running

**Issue:** Frontend type errors  
**Solution:** Ensure types match Backend DTOs exactly

**Issue:** E2E tests fail  
**Solution:** Check if backend is running, check test credentials

---

## 📝 Notes

- Tasks can be done in parallel if multiple developers available
- Phase 1 should be completed before moving to Phase 2
- Phase 2 and 3 can overlap if needed
- Always run tests before marking task complete
- Update progress tracking as you complete tasks

---

**نهاية خطة التنفيذ**

**تم إعداده بواسطة:** Kiro AI Assistant  
**التاريخ:** 26 يناير 2026  
**الإصدار:** 1.1 (محدّث بناءً على تقرير التحقق)

---

## 📝 سجل التغييرات (Changelog)

### الإصدار 1.1 - 26 يناير 2026

**المهام المحذوفة (False Positives):**
- ❌ Task 2.3: Implement Customers Search - موجود بالفعل في CustomersPage.tsx
- ❌ Task 2.6: Add Pagination to Customer Orders - موجود بالفعل في CustomerDetailsModal.tsx

**المهام المعدّلة:**
- ⚠️ Task 2.4 (الآن 2.3): Complete Loyalty Points UI - تم توضيح أن العرض موجود، فقط الأزرار مفقودة

**المهام الجديدة:**
- ➕ Task 2.6: Improve API Error Handling - مهمة جديدة مكتشفة أثناء التحقق
- ➕ Task 3.1: Optimize Client-Side Filtering - مهمة جديدة مكتشفة أثناء التحقق

**إعادة الترقيم:**
- Task 2.4 → Task 2.3 (Loyalty Points UI)
- Task 2.5 → Task 2.4 (Branches Management)
- Task 2.7 → Task 2.5 (Products Filters)
- Task 3.1-3.6 → Task 3.2-3.7 (بعد إضافة Task 3.1 الجديد)

**التأثير على الخطة:**
- عدد المهام: 14 → 14 (حذف 2، إضافة 2)
- Phase 2: 7 مهام → 6 مهام
- Phase 3: 6 مهام → 7 مهام (بعد إضافة Task 3.1)
- المدة المقدرة: 15-22 يوم → 14-21 يوم
- **وقت موفّر: 1-3 أيام**

**المرجع:** انظر `verification-report.md` و `audit-report.md` (v1.1) للتفاصيل الكاملة
