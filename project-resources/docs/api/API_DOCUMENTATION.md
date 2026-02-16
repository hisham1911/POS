# 📋 KasserPro API Documentation v2.0

> **المرجع الأساسي لنظام الكاشير الاحترافي**
>
> **Base URL:** `http://localhost:5243/api`  
> **Content-Type:** `application/json`  
> **Authentication:** Bearer JWT Token

---

## 📑 جدول المحتويات

1. [Development Workflow](#-development-workflow)
2. [Phase Overview](#-phase-overview)
3. [Architecture Rules](#-architecture-rules)
4. [API Standards](#-api-standards)
5. [Phase 1 APIs (MVP)](#-phase-1-apis-mvp---completed)
6. [Phase 2 APIs (Enhanced)](#-phase-2-apis-enhanced---planned)
7. [Phase 3 APIs (Advanced)](#-phase-3-apis-advanced---planned)
8. [Phase 4 APIs (Enterprise)](#-phase-4-apis-enterprise---planned)
9. [Error Codes](#-error-codes)
10. [Testing Strategy](#-testing-strategy)

---

## 🔄 Development Workflow

### النهج الموحد للتطوير (Backend ↔ Frontend)

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DESIGN PHASE (قبل الكود)                                     │
│     ├── تحديد الـ Entities و DTOs                                │
│     ├── تحديد الـ API Endpoints                                  │
│     ├── تحديد الـ Frontend Types                                 │
│     └── توثيق في هذا الملف أولاً                                 │
│                                                                  │
│  2. CONTRACT FIRST (العقد أولاً)                                 │
│     ├── كتابة TypeScript Types في Frontend                      │
│     ├── كتابة DTOs في Backend                                   │
│     └── التأكد من التطابق 100%                                   │
│                                                                  │
│  3. BACKEND IMPLEMENTATION                                       │
│     ├── Entity + Migration                                       │
│     ├── Repository + Service                                     │
│     ├── Controller + Validation                                  │
│     └── Integration Test                                         │
│                                                                  │
│  4. FRONTEND IMPLEMENTATION                                      │
│     ├── RTK Query API                                           │
│     ├── Redux Slice (if needed)                                 │
│     ├── Components + Pages                                       │
│     └── E2E Test                                                │
│                                                                  │
│  5. VERIFICATION                                                 │
│     ├── Run Integration Tests                                    │
│     ├── Run E2E Tests                                           │
│     └── Manual Testing                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### قواعد التطوير الذهبية

| Rule                     | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| 📝 **Document First**    | وثّق الـ API في هذا الملف قبل كتابة الكود            |
| 🔄 **Types Match**       | Frontend Types = Backend DTOs (نفس الأسماء والأنواع) |
| ✅ **Test Before Merge** | لا merge بدون E2E tests passing                      |
| 🚫 **No Magic Strings**  | استخدم Enums دائماً                                  |
| 💰 **Tax Exclusive**     | الأسعار صافية + الضريبة تُضاف                        |

### Checklist لكل Feature جديدة

```markdown
## Feature: [اسم الميزة]

### Pre-Development

- [ ] تم توثيق الـ API endpoints
- [ ] تم تحديد الـ DTOs
- [ ] تم تحديد الـ Frontend Types
- [ ] تم مراجعة الـ Architecture Rules

### Backend

- [ ] Entity created/updated
- [ ] Migration created
- [ ] Repository implemented
- [ ] Service implemented
- [ ] Controller implemented
- [ ] Validation added
- [ ] Integration test written

### Frontend

- [ ] Types added to types/\*.ts
- [ ] RTK Query API added
- [ ] Redux slice updated (if needed)
- [ ] Components created
- [ ] Page created
- [ ] E2E test added

### Verification

- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing done
```

---

## 📊 Phase Overview

### Phase 1: MVP ✅ COMPLETED

| Feature                   | Backend | Frontend | E2E Test |
| ------------------------- | :-----: | :------: | :------: |
| Authentication            |   ✅    |    ✅    |    ✅    |
| Products CRUD             |   ✅    |    ✅    |    ✅    |
| Categories CRUD           |   ✅    |    ✅    |    ✅    |
| Orders (Create, Complete) |   ✅    |    ✅    |    ✅    |
| Payments (Cash, Card)     |   ✅    |    ✅    |    ✅    |
| Shifts (Open, Close)      |   ✅    |    ✅    |    ✅    |
| Daily Reports             |   ✅    |    ✅    |    ✅    |
| Tax Configuration         |   ✅    |    ✅    |    ✅    |
| Audit Logs                |   ✅    |    ✅    |    -     |

### Phase 2: Enhanced Features 📋 PLANNED

| Feature                | Backend | Frontend | E2E Test |
| ---------------------- | :-----: | :------: | :------: |
| Customers & Loyalty    |   ⏳    |    ⏳    |    ⏳    |
| Discounts & Promotions |   ⏳    |    ⏳    |    ⏳    |
| Inventory Management   |   ⏳    |    ⏳    |    ⏳    |
| Order Refunds          |   ⏳    |    ⏳    |    ⏳    |
| Receipt Printing       |   ⏳    |    ⏳    |    ⏳    |

### Phase 3: Advanced Features 📋 PLANNED

| Feature           | Backend | Frontend | E2E Test |
| ----------------- | :-----: | :------: | :------: |
| Multi-Branch      |   ⏳    |    ⏳    |    ⏳    |
| Kitchen Display   |   ⏳    |    ⏳    |    ⏳    |
| Tables Management |   ⏳    |    ⏳    |    ⏳    |
| Modifiers         |   ⏳    |    ⏳    |    ⏳    |
| Advanced Reports  |   ⏳    |    ⏳    |    ⏳    |

### Phase 4: Enterprise 📋 PLANNED

| Feature         | Backend | Frontend | E2E Test |
| --------------- | :-----: | :------: | :------: |
| ETA E-Invoicing |   ⏳    |    ⏳    |    ⏳    |
| Offline Mode    |   ⏳    |    ⏳    |    ⏳    |
| Multi-Tenant    |   ⏳    |    ⏳    |    ⏳    |
| Webhooks        |   ⏳    |    ⏳    |    ⏳    |
| ERP Integration |   ⏳    |    ⏳    |    ⏳    |

---

## 🏛️ Architecture Rules

### Financial Logic (Tax Exclusive)

```typescript
// ✅ الطريقة الصحيحة - Tax Exclusive (Additive)
const netTotal = unitPrice * quantity;
const taxAmount = netTotal * (taxRate / 100);
const totalAmount = netTotal + taxAmount;

// ❌ ممنوع - Tax Inclusive
const taxAmount = total / (1 + taxRate / 100); // NEVER
```

### Snapshots Pattern (Data Integrity)

Orders save snapshots of related data at creation time to preserve historical accuracy:

```typescript
// Order saves:
-branchName,
  branchAddress,
  branchPhone - // Branch info at order time
    userName - // Cashier name at order time
    currencyCode - // Currency at order time
    taxRate - // Tax rate at order time
    // OrderItem saves:
    productName,
  productNameEn - // Product names at order time
    productSku,
  productBarcode - // Product identifiers
    unitPrice,
  originalPrice - // Prices at order time
    taxRate; // Tax rate at order time
```

> **Why?** If a product price changes tomorrow, historical orders still show the correct price at the time of sale.

### Multi-Tenancy

```csharp
// ✅ صحيح - استخدم ICurrentUserService
var tenantId = _currentUserService.TenantId;
var branchId = _currentUserService.BranchId;

// ❌ ممنوع - Hardcoded IDs
var tenantId = 1; // NEVER
```

### Type Safety

```typescript
// ✅ صحيح - استخدم Enums
type OrderType = "DineIn" | "Takeaway" | "Delivery";
type PaymentMethod = "Cash" | "Card" | "Fawry";

// ❌ ممنوع - Magic Strings
const orderType = "dine_in"; // NEVER
```

### Validation Rules

| Entity             | Rule                        | Error Code               |
| ------------------ | --------------------------- | ------------------------ |
| Product.Price      | `>= 0`                      | `PRODUCT_INVALID_PRICE`  |
| OrderItem.Quantity | `> 0`                       | `ORDER_INVALID_QUANTITY` |
| Order.Items        | `length > 0`                | `ORDER_EMPTY`            |
| Order.Status       | Cannot modify if `!= Draft` | `ORDER_NOT_EDITABLE`     |
| Product.IsActive   | Cannot sell if `false`      | `PRODUCT_INACTIVE`       |
| Shift              | Must be open for orders     | `NO_OPEN_SHIFT`          |

---

## 📐 API Standards

### Response Format

```typescript
// Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Error Response
interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Paginated Response
interface PaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
}
```

### HTTP Status Codes

| Code | Usage                          |
| ---- | ------------------------------ |
| 200  | Success (GET, PUT)             |
| 201  | Created (POST)                 |
| 204  | No Content (DELETE)            |
| 400  | Bad Request (Validation Error) |
| 401  | Unauthorized                   |
| 403  | Forbidden                      |
| 404  | Not Found                      |
| 409  | Conflict                       |
| 500  | Server Error                   |

### Naming Conventions

| Type          | Convention | Example                     |
| ------------- | ---------- | --------------------------- |
| Endpoints     | kebab-case | `/api/order-items`          |
| Query Params  | camelCase  | `?pageSize=10`              |
| Request Body  | camelCase  | `{ "orderType": "DineIn" }` |
| Response Body | camelCase  | `{ "totalAmount": 100 }`    |

---

## ✅ Phase 1 APIs (MVP) - COMPLETED

### 1. Authentication

#### POST /api/auth/login

```typescript
// Request
interface LoginRequest {
  email: string;
  password: string;
}

// Response
interface LoginResponse {
  accessToken: string; // JWT Token
  expiresAt: string; // ISO DateTime
  user: {
    id: number;
    name: string;
    email: string;
    role: "Admin" | "Cashier";
  };
}
```

#### GET /api/auth/me

```typescript
// Response - Returns current authenticated user info
interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Cashier";
}
```

> **Note:** Refresh Token functionality is planned for Phase 2.

---

### 2. Products

#### GET /api/products

```typescript
// Query Params
interface ProductsQuery {
  categoryId?: number;
  search?: string;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// Response Item
interface ProductDto {
  id: number;
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  imageUrl?: string;
  categoryId: number;
  categoryName?: string;
  isActive: boolean;
  trackInventory: boolean;
  stockQuantity: number;
  createdAt: string;
  updatedAt?: string;
}
```

#### POST /api/products

```typescript
// Request
interface CreateProductRequest {
  name: string;
  nameEn?: string;
  description?: string;
  price: number; // Must be >= 0
  cost?: number;
  sku?: string;
  barcode?: string;
  imageUrl?: string;
  categoryId: number;
  isActive?: boolean;
  trackInventory?: boolean;
  stockQuantity?: number;
}
```

#### PUT /api/products/{id}

```typescript
// Request
interface UpdateProductRequest {
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  imageUrl?: string;
  categoryId: number;
  isActive: boolean;
  trackInventory?: boolean;
  stockQuantity?: number;
}
```

#### DELETE /api/products/{id}

```
Response: 204 No Content
```

---

### 3. Categories

#### GET /api/categories

```typescript
interface CategoryDto {
  id: number;
  name: string;
  nameEn?: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}
```

#### POST /api/categories

```typescript
interface CreateCategoryRequest {
  name: string;
  nameEn?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
}
```

#### PUT /api/categories/{id}

```typescript
interface UpdateCategoryRequest {
  name: string;
  nameEn?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive: boolean;
}
```

---

### 4. Orders

#### GET /api/orders

```typescript
interface OrdersQuery {
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

type OrderStatus = "Draft" | "Pending" | "Completed" | "Cancelled" | "Refunded";
type OrderType = "DineIn" | "Takeaway" | "Delivery";
type PaymentMethod = "Cash" | "Card" | "Fawry";

interface OrderDto {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  orderType: OrderType;

  // Branch Snapshot (saved at order time)
  branchId: number;
  branchName?: string;
  branchAddress?: string;
  branchPhone?: string;

  // Currency
  currencyCode: string; // Default: "EGP"

  // Totals
  subtotal: number;
  discountType?: string;
  discountValue?: number;
  discountAmount: number;
  discountCode?: string;
  taxRate: number;
  taxAmount: number;
  serviceChargePercent: number;
  serviceChargeAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  changeAmount: number;

  // Customer
  customerName?: string;
  customerPhone?: string;
  customerId?: number;
  notes?: string;

  // User & Shift
  userId: number;
  userName?: string; // Snapshot
  shiftId?: number;

  // Timestamps
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;

  items: OrderItemDto[];
  payments: PaymentDto[];
}

interface OrderItemDto {
  id: number;
  productId: number;

  // Product Snapshot (saved at order time)
  productName: string;
  productNameEn?: string;
  productSku?: string;
  productBarcode?: string;

  // Price Snapshot
  unitPrice: number; // Net price (excluding tax)
  originalPrice: number;
  quantity: number;

  // Discount
  discountType?: string;
  discountValue?: number;
  discountAmount: number;
  discountReason?: string;

  // Tax (Tax Exclusive model)
  taxRate: number;
  taxAmount: number;
  taxInclusive: boolean; // Always false

  subtotal: number; // unitPrice * quantity
  total: number; // subtotal + taxAmount
  notes?: string;
}

interface PaymentDto {
  id: number;
  method: PaymentMethod;
  amount: number;
  reference?: string;
}
```

#### POST /api/orders

```typescript
interface CreateOrderRequest {
  orderType?: OrderType; // Default: 'DineIn'
  items: CreateOrderItemRequest[];
  customerName?: string;
  customerPhone?: string;
  customerId?: number;
  notes?: string;
}

interface CreateOrderItemRequest {
  productId: number;
  quantity: number; // Must be > 0
  notes?: string;
}
```

> **Validation Rules:**
>
> - `items` must have at least 1 item (`ORDER_EMPTY`)
> - Each `quantity` must be > 0 (`ORDER_INVALID_QUANTITY`)
> - Product must exist and be active (`PRODUCT_NOT_FOUND`, `PRODUCT_INACTIVE`)
> - User must have an open shift (`NO_OPEN_SHIFT`)

#### POST /api/orders/{id}/items

```typescript
interface AddOrderItemRequest {
  productId: number;
  quantity: number;
}
```

#### DELETE /api/orders/{id}/items/{itemId}

```
Response: 204 No Content
Note: Only works if order.status == 'Draft'
```

#### POST /api/orders/{id}/complete

```typescript
interface CompleteOrderRequest {
  payments: PaymentRequest[];
}

interface PaymentRequest {
  method: PaymentMethod;
  amount: number;
}

type PaymentMethod = "Cash" | "Card" | "Fawry";
```

#### POST /api/orders/{id}/cancel

```
Response: 200 OK with updated OrderDto
Note: Only works if order.status != 'Completed'
```

---

### 5. Shifts

#### GET /api/shifts/current

Returns the current open shift for the authenticated user in the current branch.

```typescript
interface ShiftDto {
  id: number;
  openingBalance: number;
  closingBalance: number;
  expectedBalance: number; // openingBalance + totalCash
  difference: number; // closingBalance - expectedBalance
  openedAt: string;
  closedAt?: string;
  isClosed: boolean;
  notes?: string;

  // Totals
  totalCash: number;
  totalCard: number;
  totalOrders: number;

  // User
  userName: string;

  // Orders in this shift (simplified view)
  orders: ShiftOrderDto[];
}

interface ShiftOrderDto {
  id: number;
  orderNumber: string;
  status: string;
  orderType?: string;
  total: number;
  customerName?: string;
  createdAt: string;
  completedAt?: string;
}
```

#### POST /api/shifts/open

```typescript
interface OpenShiftRequest {
  openingBalance: number; // Must be >= 0
}
```

#### POST /api/shifts/close

```typescript
interface CloseShiftRequest {
  closingBalance: number; // Actual cash in drawer
  notes?: string;
}
```

> **Concurrency:** Shifts use optimistic locking (RowVersion). If another user modifies the shift, you'll receive `SHIFT_CONCURRENCY_CONFLICT` error.

---

### 6. Reports

#### GET /api/reports/daily?date={date}

```typescript
interface DailyReportDto {
  date: string; // ISO Date (YYYY-MM-DD)
  branchId: number;
  branchName?: string;

  // Order Counts
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;

  // Sales Totals (Tax Exclusive model)
  grossSales: number; // Subtotal before discounts
  totalDiscount: number;
  netSales: number; // After discounts, before tax
  totalTax: number;
  totalSales: number; // Final total (netSales + totalTax)

  // Payment Breakdown
  totalCash: number;
  totalCard: number;
  totalFawry: number;
  totalOther: number;

  // Analytics
  topProducts: TopProductDto[];
  hourlySales: HourlySalesDto[];
}

interface TopProductDto {
  productId: number;
  productName: string;
  quantitySold: number;
  totalSales: number;
}

interface HourlySalesDto {
  hour: number; // 0-23
  orderCount: number;
  sales: number;
}
```

#### GET /api/reports/sales?fromDate={date}&toDate={date}

```typescript
interface SalesReportDto {
  fromDate: string;
  toDate: string;
  totalSales: number;
  totalCost: number;
  grossProfit: number;
  totalOrders: number;
  averageOrderValue: number;
  dailySales: DailySalesDto[];
}

interface DailySalesDto {
  date: string;
  sales: number;
  orders: number;
}
```

---

### 7. Tenants (Settings)

#### GET /api/tenants/current

```typescript
interface TenantDto {
  id: number;
  name: string;
  nameEn?: string;
  currency: string;
  timezone: string;
  taxRate: number;
  isTaxEnabled: boolean;
  logoUrl?: string;
}
```

#### PUT /api/tenants/current

```typescript
interface UpdateTenantRequest {
  name: string;
  nameEn?: string;
  currency: string;
  timezone: string;
  taxRate: number;
  isTaxEnabled: boolean;
}
```

---

### 8. Audit Logs

#### GET /api/audit-logs

```typescript
interface AuditLogsQuery {
  entityType?: string;
  entityId?: number;
  action?: string;
  userId?: number;
  fromDate?: string;
  toDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

interface AuditLogDto {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  oldValues?: string;
  newValues?: string;
  userId: number;
  userName: string;
  ipAddress?: string;
  createdAt: string;
}
```

---

## 📋 Phase 2 APIs (Enhanced) - PLANNED

### 1. Customers

```typescript
// GET /api/customers
// POST /api/customers
// PUT /api/customers/{id}
// DELETE /api/customers/{id}

interface CustomerDto {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

interface CreateCustomerRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}
```

### 2. Discounts

```typescript
// GET /api/discounts
// POST /api/discounts
// PUT /api/discounts/{id}
// DELETE /api/discounts/{id}

type DiscountType = "Percentage" | "FixedAmount";

interface DiscountDto {
  id: number;
  name: string;
  code?: string;
  type: DiscountType;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  usageCount: number;
  usageLimit?: number;
}
```

### 3. Inventory

```typescript
// GET /api/inventory
// POST /api/inventory/adjust
// GET /api/inventory/movements

interface InventoryDto {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  lastUpdated: string;
}

interface InventoryAdjustmentRequest {
  productId: number;
  quantity: number; // Positive or negative
  reason: string;
  referenceNumber?: string;
}
```

### 4. Refunds

```typescript
// POST /api/orders/{id}/refund

type RefundType = "Full" | "Partial";

interface RefundRequest {
  type: RefundType;
  amount?: number; // Required for partial
  reason: string;
  items?: RefundItemRequest[]; // For partial item refund
}

interface RefundItemRequest {
  orderItemId: number;
  quantity: number;
}
```

---

## 📋 Phase 3 APIs (Advanced) - PLANNED

### 1. Tables (Restaurant)

```typescript
interface TableDto {
  id: number;
  number: string;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved";
  currentOrderId?: number;
  section?: string;
}
```

### 2. Modifiers

```typescript
interface ModifierGroupDto {
  id: number;
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  modifiers: ModifierDto[];
}

interface ModifierDto {
  id: number;
  name: string;
  price: number;
  isDefault: boolean;
}
```

### 3. Kitchen Display

```typescript
interface KitchenOrderDto {
  orderId: number;
  orderNumber: string;
  orderType: OrderType;
  tableName?: string;
  items: KitchenItemDto[];
  createdAt: string;
  priority: "Normal" | "Rush";
}

interface KitchenItemDto {
  id: number;
  productName: string;
  quantity: number;
  modifiers: string[];
  notes?: string;
  status: "Pending" | "Preparing" | "Ready";
}
```

---

## 📋 Phase 4 APIs (Enterprise) - PLANNED

### 1. ETA E-Invoicing

```typescript
// POST /api/invoices/{orderId}/submit-eta

interface ETAInvoiceResponse {
  uuid: string;
  submissionId: string;
  status: "Submitted" | "Valid" | "Invalid" | "Rejected";
  qrCode: string;
}
```

### 2. Webhooks

```typescript
// GET /api/webhooks
// POST /api/webhooks
// DELETE /api/webhooks/{id}

interface WebhookDto {
  id: number;
  url: string;
  events: WebhookEvent[];
  isActive: boolean;
  secret: string;
}

type WebhookEvent =
  | "order.created"
  | "order.completed"
  | "order.cancelled"
  | "shift.opened"
  | "shift.closed"
  | "inventory.low";
```

---

## ⚠️ Error Codes

### Authentication Errors (1xxx)

| Code | Constant                   | Message                 |
| ---- | -------------------------- | ----------------------- |
| 1001 | `AUTH_INVALID_CREDENTIALS` | بيانات الدخول غير صحيحة |
| 1002 | `AUTH_TOKEN_EXPIRED`       | انتهت صلاحية الجلسة     |
| 1003 | `AUTH_UNAUTHORIZED`        | غير مصرح                |

### Validation Errors (2xxx)

| Code | Constant                    | Message        |
| ---- | --------------------------- | -------------- |
| 2001 | `VALIDATION_REQUIRED`       | حقل مطلوب      |
| 2002 | `VALIDATION_INVALID_FORMAT` | صيغة غير صحيحة |

### Business Errors (3xxx)

| Code | Constant                 | Message                        |
| ---- | ------------------------ | ------------------------------ |
| 3001 | `NO_OPEN_SHIFT`          | يجب فتح وردية أولاً            |
| 3002 | `SHIFT_ALREADY_OPEN`     | يوجد وردية مفتوحة بالفعل       |
| 3003 | `ORDER_EMPTY`            | لا يمكن إنشاء طلب فارغ         |
| 3004 | `ORDER_NOT_EDITABLE`     | لا يمكن تعديل هذا الطلب        |
| 3005 | `PRODUCT_INACTIVE`       | المنتج غير متاح                |
| 3006 | `PRODUCT_INVALID_PRICE`  | سعر المنتج غير صالح            |
| 3007 | `ORDER_INVALID_QUANTITY` | الكمية يجب أن تكون أكبر من صفر |
| 3008 | `PAYMENT_INSUFFICIENT`   | المبلغ المدفوع أقل من الإجمالي |
| 3009 | `CATEGORY_HAS_PRODUCTS`  | لا يمكن حذف تصنيف يحتوي منتجات |

### Not Found Errors (4xxx)

| Code | Constant             | Message            |
| ---- | -------------------- | ------------------ |
| 4001 | `PRODUCT_NOT_FOUND`  | المنتج غير موجود   |
| 4002 | `CATEGORY_NOT_FOUND` | التصنيف غير موجود  |
| 4003 | `ORDER_NOT_FOUND`    | الطلب غير موجود    |
| 4004 | `SHIFT_NOT_FOUND`    | الوردية غير موجودة |

---

## 🧪 Testing Strategy

### Test Pyramid

```
        ┌─────────┐
        │  E2E    │  ← Playwright (6 scenarios)
       ┌┴─────────┴┐
       │Integration│  ← xUnit + WebApplicationFactory
      ┌┴───────────┴┐
      │    Unit     │  ← xUnit (Business Logic)
     └──────────────┘
```

### E2E Test Scenarios

| Scene    | Description                  | File                    |
| -------- | ---------------------------- | ----------------------- |
| Scene 1  | Admin Setup - Tax Config     | `complete-flow.spec.ts` |
| Scene 2  | Cashier Workday - Full Order | `complete-flow.spec.ts` |
| Scene 3a | Empty Cart Prevention        | `complete-flow.spec.ts` |
| Scene 3b | No Shift Prevention          | `complete-flow.spec.ts` |
| Scene 4  | Report Verification          | `complete-flow.spec.ts` |
| Cleanup  | Reset Tax Rate               | `complete-flow.spec.ts` |

### Running Tests

```bash
# E2E Tests
cd client
npm run test:e2e          # Headless
npm run test:e2e:headed   # With browser
npm run test:e2e:ui       # Playwright UI

# Integration Tests
cd src/KasserPro.Tests
dotnet test
```

### Test Credentials

| Role    | Email               | Password  |
| ------- | ------------------- | --------- |
| Admin   | admin@kasserpro.com | Admin@123 |
| Cashier | ahmed@kasserpro.com | 123456    |

---

## 📝 Configuration

### Ports

| Service      | Port |
| ------------ | ---- |
| Backend API  | 5243 |
| Frontend Dev | 3000 |

### Tax Configuration

| Setting      | Value                    |
| ------------ | ------------------------ |
| Default Rate | 14%                      |
| Model        | Tax Exclusive (Additive) |
| Currency     | EGP                      |
| Timezone     | Africa/Cairo             |

---

## 📚 Related Documents

- [Architecture Manifest](../KASSERPRO_ARCHITECTURE_MANIFEST.md) - القواعد والمعايير
- [System Health Report](../SYSTEM_HEALTH_REPORT.md) - تقرير صحة النظام
- [Design System](../design/DESIGN_SYSTEM.md) - نظام التصميم

---

**Last Updated:** January 8, 2026  
**Version:** 2.0  
**Status:** Phase 1 Complete ✅
