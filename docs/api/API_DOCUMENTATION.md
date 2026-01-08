# 📋 KasserPro API Documentation

## دليل API Endpoints الكامل لنظام الكاشير الاحترافي

> هذا الدليل يحتوي على جميع الـ API Endpoints المطلوبة لبناء نظام كاشير احترافي مشابه لـ Foodics
>
> **Base URL:** `https://localhost:5243/api` (Development)
>
> **Content-Type:** `application/json`

---

## 🆕 ملخص التحديثات الأخيرة (Phase 1)

### ✅ ICurrentUserService و تبديل الفروع
- استخدام `ICurrentUserService` لاستخراج TenantId و BranchId من JWT و Headers
- دعم تبديل الفروع عبر `X-Branch-Id` header
- جميع الـ Queries تُفلتر تلقائياً حسب TenantId و BranchId

### ✅ Price & Tax Snapshots
- حفظ snapshot كامل للمنتج عند إنشاء الطلب (الاسم، SKU، الباركود، السعر)
- حفظ snapshot للفرع (الاسم، العنوان، الهاتف)
- حفظ snapshot للمستخدم (الاسم)
- حفظ معدل الضريبة و TaxInclusive لكل OrderItem

### ✅ ربط الطلبات بالورديات (Shift-Order Linking)
- كل طلب يُربط تلقائياً بالوردية المفتوحة (`shift_id`)
- يجب فتح وردية قبل إنشاء أي طلب (Error: `NO_OPEN_SHIFT`)
- حساب إجماليات الوردية ديناميكياً من الطلبات المكتملة

### ✅ Audit Log محسّن
- تسجيل `user_id` و `user_name` من JWT claims
- تسجيل `ip_address` من HTTP headers
- حفظ `entity_id` الصحيح للكيانات الجديدة (بعد الإنشاء)

### ✅ المنطقة الزمنية (Timezone)
- Backend: يخزن بتوقيت UTC
- Frontend: يعرض بتوقيت القاهرة (Africa/Cairo)

### ✅ ضريبة القيمة المضافة (Egypt VAT)
- نسبة الضريبة: 14%
- Tax Inclusive: السعر يشمل الضريبة
- العملة: الجنيه المصري (EGP)

---

## 📑 جدول المحتويات

### 🏗️ Architecture (المعمارية)

- [Architecture Overview](#️-architecture-overview-نظرة-معمارية)
- [Multi-Tenant Architecture](#-multi-tenant-architecture)
- [Offline-First & Sync Strategy](#-offline-first--sync-strategy)
- [Idempotency](#-idempotency-منع-التكرار)
- [Order Lifecycle](#-order-lifecycle--state-machine)
- [Price & Tax Snapshot](#-price--tax-snapshot)
- [Authorization & Permissions](#️-authorization--permission-matrix)
- [Error Codes](#️-error-codes-أكواد-الأخطاء)
- [API Versioning](#-api-versioning-strategy)
- [Audit Log](#-audit-log--data-ownership)
- [Performance & Limits](#-performance--limits)

### 📋 Core APIs

1. [Authentication (المصادقة)](#1--authentication-المصادقة)
2. [Tenants (الشركات/المستأجرين)](#2--tenants-الشركاتالمستأجرين)
3. [Users & Employees (المستخدمين)](#3--users--employees-المستخدمين-والموظفين)
4. [Branches/Locations (الفروع)](#4--brancheslocations-الفروع)
5. [Products (المنتجات)](#5--products-المنتجات)
6. [Categories (التصنيفات)](#6--categories-التصنيفات)
7. [Inventory (المخزون)](#7--inventory-المخزون)
8. [Orders/Sales (الطلبات)](#8--orderssales-الطلباتالمبيعات)
9. [Payments (المدفوعات)](#9--payments-المدفوعات)
10. [Customers (العملاء)](#10--customers-العملاء)
11. [Discounts & Promotions (الخصومات)](#11--discounts--promotions-الخصومات-والعروض)
12. [Cash Register/Shifts (الورديات)](#12--cash-registershifts-الكاشيرالورديات)
13. [Taxes (الضرائب)](#13--taxes-الضرائب)

### 🍽️ Restaurant Features

14. [Tables (الطاولات)](#14--tables-الطاولات---للمطاعم)
15. [Modifiers (الإضافات)](#15--modifiers-الإضافات)
16. [Kitchen Display (شاشة المطبخ)](#16--kitchen-display-شاشة-المطبخ)
17. [Reservations (الحجوزات)](#17--reservations-الحجوزات)

### 📦 Inventory & Purchasing

18. [Suppliers (الموردين)](#18--suppliers-الموردين)
19. [Purchase Orders (أوامر الشراء)](#19--purchase-orders-أوامر-الشراء)
20. [Recipes/BOM (الوصفات)](#20--recipesbom-الوصفاتقائمة-المواد)

### 📊 Reporting & Analytics

21. [Reports (التقارير)](#21--reports-التقارير)
22. [Audit Logs (سجل التدقيق)](#22--audit-logs-سجل-التدقيق)

### 🔧 System & Integration

23. [Notifications (الإشعارات)](#23--notifications-الإشعارات)
24. [Settings (الإعدادات)](#24--settings-الإعدادات)
25. [Sync (المزامنة)](#25--sync-المزامنة---للـ-offline)
26. [ETA E-Invoicing (الفوترة الإلكترونية)](#26--eta-e-invoicing-الفوترة-الإلكترونية)
27. [Webhooks](#27--webhooks)
28. [ERP Integration (الربط)](#28--erp-integration-للربط-مع-erp)

---

## 🏗️ Architecture Overview (نظرة معمارية)

### 🎯 نوع النظام

- **Multi-Tenant SaaS**: نظام مشترك لعدة شركات
- **Offline-First**: يعمل بدون إنترنت مع مزامنة لاحقة
- **Multi-Branch**: دعم فروع متعددة لكل شركة
- **Business Types**: مطاعم + محلات تجزئة

---

## 🔐 Multi-Tenant Architecture

### Tenant Isolation Strategy

النظام يستخدم **Shared Database with Tenant Discrimination**

```
┌─────────────────────────────────────────────────────────┐
│                    Shared Database                       │
├─────────────────────────────────────────────────────────┤
│  tenant_id │  branch_id  │  data...                     │
│     1      │      1      │  Company A - Branch 1        │
│     1      │      2      │  Company A - Branch 2        │
│     2      │      3      │  Company B - Branch 1        │
└─────────────────────────────────────────────────────────┘
```

### Tenant Identification

يتم تحديد الـ Tenant من خلال:

1. **JWT Token** (Primary): الـ `tenant_id` مُشفر داخل التوكن
2. **X-Tenant-Id Header** (Secondary): للـ Service-to-Service calls
3. **Subdomain** (Optional): `company.kasserpro.com`

### Data Isolation Rules

| Entity   | Isolation Level | Notes                               |
| -------- | --------------- | ----------------------------------- |
| Orders   | Tenant + Branch | الطلبات معزولة بالشركة والفرع       |
| Products | Tenant          | المنتجات مشتركة بين فروع نفس الشركة |
| Users    | Tenant          | المستخدمين تابعين للشركة            |
| Settings | Tenant + Branch | إعدادات لكل فرع                     |
| Reports  | Tenant + Branch | التقارير حسب الصلاحيات              |

### Global Filters (Backend Implementation)

```csharp
// كل Query يُضاف له تلقائياً
.Where(x => x.TenantId == CurrentTenant.Id)
```

---

## 🔄 Offline-First & Sync Strategy

### Architecture

```
┌──────────────┐         ┌──────────────┐
│   POS App    │◄───────►│  Local DB    │
│  (Frontend)  │         │  (IndexedDB) │
└──────┬───────┘         └──────────────┘
       │ When Online
       ▼
┌──────────────┐         ┌──────────────┐
│  Sync Queue  │────────►│ Cloud Server │
└──────────────┘         └──────────────┘
```

### Sync Flow

1. **Write Locally First**: كل العمليات تُحفظ محلياً أولاً
2. **Queue for Sync**: تُضاف للـ Sync Queue
3. **Push When Online**: تُرفع للسيرفر عند توفر الإنترنت
4. **Pull Server Changes**: تُسحب التغييرات من السيرفر

### Conflict Resolution Strategy

| Conflict Type         | Resolution               | Notes                         |
| --------------------- | ------------------------ | ----------------------------- |
| Order Created Offline | **Client Wins**          | الطلبات المحلية دائماً تُقبل  |
| Product Updated       | **Server Wins**          | المنتجات من السيرفر           |
| Customer Updated      | **Last Write Wins**      | بناءً على `updated_at`        |
| Inventory Conflict    | **Server Wins + Notify** | مع إشعار للمستخدم             |
| Price Changed         | **Server Wins**          | الأسعار من السيرفر دائماً     |
| Discount Applied      | **Validate & Accept**    | التحقق من صلاحية الخصم        |
| Shift Operations      | **Client Wins**          | عمليات الوردية المحلية مقبولة |

### 📊 Detailed Conflict Resolution Matrix

```typescript
const CONFLICT_RESOLUTION: ConflictMatrix = {
  // Orders - Client always wins (offline orders are sacred)
  order: {
    create: "CLIENT_WINS",
    update: "CLIENT_WINS", // Only if still in editable state
    complete: "CLIENT_WINS",
  },

  // Products - Server is source of truth
  product: {
    create: "SERVER_WINS",
    update: "SERVER_WINS",
    delete: "SERVER_WINS",
    price_change: "SERVER_WINS",
  },

  // Inventory - Complex resolution
  inventory: {
    adjustment: "MERGE", // Sum all adjustments
    sale_deduction: "ACCEPT_ALL", // All sales deductions accepted
    transfer: "QUEUE_FOR_REVIEW", // Manual review if conflict
    count: "LAST_WRITE_WINS", // Latest count wins
  },

  // Customers - Last write wins with merge option
  customer: {
    create: "MERGE_BY_PHONE", // Merge if same phone
    update: "LAST_WRITE_WINS",
    points_adjustment: "MERGE", // Sum all adjustments
  },

  // Shifts - Client wins (happened in real world)
  shift: {
    open: "CLIENT_WINS",
    close: "CLIENT_WINS",
    cash_in: "CLIENT_WINS",
    cash_out: "CLIENT_WINS",
  },
};
```

### ⚠️ Complex Conflict Example

```json
{
  "conflict_type": "CONCURRENT_MODIFICATION",
  "entity": "inventory",
  "entity_id": "product-123",

  "client_state": {
    "quantity": 45,
    "version": 10,
    "modified_at": "2024-01-15T10:30:00Z",
    "modified_by": "user-1",
    "operation": "SALE (-5)"
  },

  "server_state": {
    "quantity": 42,
    "version": 11,
    "modified_at": "2024-01-15T10:31:00Z",
    "modified_by": "user-2",
    "operation": "ADJUSTMENT (-8)"
  },

  "resolution_required": true,
  "auto_resolution": null,
  "suggested_action": "REVIEW_MANUALLY",
  "suggested_resolution": {
    "merge_strategy": "Accept both operations",
    "final_quantity": 37,
    "explanation": "Server: 50 → 42 (-8), then Client sale: 42 → 37 (-5)"
  }
}
```

### Conflict Response Format

```json
{
  "success": false,
  "error_code": "SYNC_CONFLICT",
  "data": {
    "entity": "customer",
    "entity_id": 123,
    "local_version": {
      "name": "أحمد محمد",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    "server_version": {
      "name": "أحمد محمد علي",
      "updated_at": "2024-01-15T10:35:00Z"
    },
    "suggested_resolution": "server_wins",
    "conflict_id": "conf_abc123"
  }
}
```

### Versioning Strategy

كل Entity يحتوي على:

```json
{
  "id": 1,
  "version": 5,
  "local_id": "uuid-local-123",
  "server_id": 456,
  "sync_status": "synced",
  "updated_at": "2024-01-15T10:30:00Z",
  "synced_at": "2024-01-15T10:35:00Z"
}
```

---

## 🔑 Idempotency (منع التكرار)

### 🎯 Why Idempotency Matters

```
┌─────────────────────────────────────────────────────────────────┐
│  SCENARIO: Network timeout during payment                        │
│                                                                  │
│  1. Cashier clicks "Pay" → Request sent                          │
│  2. Server processes payment ✓                                   │
│  3. Network drops before response                                │
│  4. Cashier sees error, clicks "Pay" again                       │
│  5. WITHOUT Idempotency: Double charge! 💀                       │
│  6. WITH Idempotency: Same result returned ✓                     │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation

**Header المطلوب للعمليات الحساسة:**

```http
Idempotency-Key: {unique-uuid}
```

### 🔑 Idempotency Key Generation

```typescript
class IdempotencyService {
  generateKey(operation: string, data: any): string {
    const deviceId = this.getDeviceId();
    const timestamp = Date.now();
    const hash = this.hashData(data);
    return `${deviceId}-${operation}-${timestamp}-${hash}`;
  }

  // Recommended patterns per operation
  generateOrderKey(cartItems: CartItem[]): string {
    return `${this.deviceId}-order-${Date.now()}-${this.hash(cartItems)}`;
  }

  generatePaymentKey(orderId: string, amount: number, method: string): string {
    return `${orderId}-${amount}-${method}`;
  }

  generateRefundKey(orderId: string, refundType: string): string {
    return `${orderId}-refund-${refundType}`;
  }
}
```

### العمليات المشمولة

| Operation                      | Required | Key Generation                   | TTL     |
| ------------------------------ | -------- | -------------------------------- | ------- |
| `POST /api/orders`             | ✅ مطلوب | `{device_id}-{timestamp}-{hash}` | 24 ساعة |
| `POST /api/payments`           | ✅ مطلوب | `{order_id}-{amount}-{method}`   | 24 ساعة |
| `POST /api/orders/{id}/refund` | ✅ مطلوب | `{order_id}-{refund_type}`       | 24 ساعة |
| `POST /api/inventory/adjust`   | ✅ مطلوب | `{reference_number}`             | 1 ساعة  |
| `POST /api/shifts/open`        | ✅ مطلوب | `{user_id}-{date}-{register}`    | 1 ساعة  |
| `POST /api/shifts/close`       | ✅ مطلوب | `{shift_id}`                     | 1 ساعة  |
| `POST /api/sync/push`          | ✅ مطلوب | `{device_id}-{batch_id}`         | 1 ساعة  |

### 💾 Server-Side Implementation

```csharp
public class IdempotencyMiddleware
{
    // Store: Redis or Database
    // Key: Idempotency-Key
    // Value: { response, status_code, created_at }
    // TTL: 24 hours

    public async Task InvokeAsync(HttpContext context)
    {
        var idempotencyKey = context.Request.Headers["Idempotency-Key"];

        if (string.IsNullOrEmpty(idempotencyKey))
        {
            // Generate warning for critical endpoints
            if (IsCriticalEndpoint(context.Request.Path))
            {
                context.Response.Headers.Add("X-Idempotency-Warning",
                    "Missing Idempotency-Key for critical operation");
            }
        }
        else
        {
            var cached = await _cache.GetAsync(idempotencyKey);
            if (cached != null)
            {
                // Return cached response
                context.Response.StatusCode = cached.StatusCode;
                context.Response.Headers.Add("X-Idempotency-Replayed", "true");
                await context.Response.WriteAsync(cached.Body);
                return;
            }
        }

        await _next(context);

        // Cache successful responses
        if (context.Response.StatusCode < 400 && !string.IsNullOrEmpty(idempotencyKey))
        {
            await _cache.SetAsync(idempotencyKey, response, TimeSpan.FromHours(24));
        }
    }
}
```

### 📱 Client-Side Retry Logic

```typescript
async executeWithRetry<T>(
  operation: () => Promise<T>,
  idempotencyKey: string,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (error.isNetworkError && i < maxRetries - 1) {
        await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}
```

### Response for Duplicate Request

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "idempotency_key": "uuid-123",
    "is_replay": true,
    "original_request_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## 📋 Order Lifecycle & State Machine

### Order States

```
                    ┌─────────────┐
                    │    draft    │ (طلب مفتوح/معلق)
                    └──────┬──────┘
                           │ confirm
                           ▼
                    ┌─────────────┐
        ┌──────────│   pending   │──────────┐
        │          └──────┬──────┘          │
        │ void            │ prepare         │ cancel
        ▼                 ▼                 ▼
┌─────────────┐    ┌─────────────┐   ┌─────────────┐
│   voided    │    │  preparing  │   │  cancelled  │
└─────────────┘    └──────┬──────┘   └─────────────┘
                          │ complete
                          ▼
                   ┌─────────────┐
        ┌─────────│  completed  │─────────┐
        │         └─────────────┘         │
        │ partial_refund                  │ full_refund
        ▼                                 ▼
┌──────────────────┐              ┌─────────────┐
│ partially_refunded│              │   refunded  │
└──────────────────┘              └─────────────┘
```

### State Transition Rules

| From State  | Allowed Actions               | Not Allowed          |
| ----------- | ----------------------------- | -------------------- |
| `draft`     | update, confirm, cancel, void | refund, complete     |
| `pending`   | update, prepare, cancel, void | refund               |
| `preparing` | complete, cancel              | update, refund       |
| `completed` | refund (full/partial)         | update, cancel, void |
| `refunded`  | ❌ No actions                 | All                  |
| `voided`    | ❌ No actions                 | All                  |
| `cancelled` | ❌ No actions                 | All                  |

### Update Rules

```json
{
  "can_update_items": ["draft", "pending"],
  "can_update_payment": ["draft", "pending", "completed"],
  "can_add_items": ["draft", "pending", "preparing"],
  "read_only_states": ["completed", "refunded", "voided", "cancelled"]
}
```

---

## 💰 Price & Tax Snapshot

### مبدأ أساسي

**كل الأسعار والضرائب تُحفظ كـ Snapshot داخل الطلب** - لا نعتمد على Reference فقط.

### Order Item Structure

```json
{
  "order_items": [
    {
      "id": 1,
      "product_id": 100,
      "product_snapshot": {
        "name": "برجر كلاسيك",
        "name_en": "Classic Burger",
        "sku": "BRG001",
        "barcode": "6281000000001",
        "original_price": 25.0
      },
      "unit_price": 25.0,
      "unit_cost": 12.0,
      "quantity": 2,
      "discount_amount": 2.5,
      "discount_snapshot": {
        "discount_id": 5,
        "name": "خصم 10%",
        "type": "percentage",
        "value": 10
      },
      "tax_rate": 14.0,
      "tax_amount": 6.14,
      "tax_inclusive": true,
      "tax_snapshot": {
        "tax_id": 1,
        "name": "ضريبة القيمة المضافة",
        "rate": 14.0,
        "is_inclusive": true
      },
      "subtotal": 50.0,
      "total": 47.5,
      "modifiers_snapshot": [
        {
          "modifier_id": 1,
          "name": "جبنة إضافية",
          "price": 3.0
        }
      ]
    }
  ]
}
```

### 💰 حساب الضريبة (Tax Inclusive - مصر)

في مصر، الأسعار تشمل ضريبة القيمة المضافة (14%). الحساب كالتالي:

```
السعر الإجمالي (شامل الضريبة) = unit_price × quantity
السعر الصافي = السعر الإجمالي ÷ (1 + tax_rate/100)
مبلغ الضريبة = السعر الإجمالي - السعر الصافي

مثال:
- السعر: 25 جنيه (شامل الضريبة)
- الكمية: 2
- الإجمالي: 50 جنيه
- السعر الصافي: 50 ÷ 1.14 = 43.86 جنيه
- مبلغ الضريبة: 50 - 43.86 = 6.14 جنيه
```

### لماذا Snapshot؟

1. ✅ السعر وقت البيع مسجل حتى لو تغير لاحقاً
2. ✅ الضريبة محسوبة صح حتى لو تغير المعدل
3. ✅ التقارير المالية دقيقة
4. ✅ الامتثال الضريبي (مصلحة الضرائب المصرية)
5. ✅ حل النزاعات مع العملاء

### 📊 Database Schemas (SQL)

#### Orders Table

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL,
    branch_id UUID NOT NULL,

    -- ✅ BRANCH SNAPSHOT
    branch_name VARCHAR(255),
    branch_address TEXT,
    branch_tax_number VARCHAR(50),

    -- Customer (Reference + Snapshot)
    customer_id UUID,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),

    -- ✅ PRICING SNAPSHOT
    currency_code VARCHAR(3) DEFAULT 'EGP',
    subtotal DECIMAL(12,2) NOT NULL,

    -- Discount Snapshot
    discount_type VARCHAR(20),
    discount_value DECIMAL(10,2),
    discount_amount DECIMAL(12,2) DEFAULT 0,
    discount_code VARCHAR(50),
    discount_id UUID,

    -- Tax Snapshot
    tax_amount DECIMAL(12,2) DEFAULT 0,
    tax_details JSONB,  -- Breakdown by tax type

    -- Service Charge
    service_charge_percent DECIMAL(5,2),
    service_charge_amount DECIMAL(12,2) DEFAULT 0,

    -- Final Total
    total DECIMAL(12,2) NOT NULL,

    -- ✅ PAYMENT SNAPSHOT
    amount_paid DECIMAL(12,2) DEFAULT 0,
    amount_due DECIMAL(12,2),
    change_given DECIMAL(12,2) DEFAULT 0,

    -- Status & Type
    status VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    order_type VARCHAR(20) NOT NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,

    -- Audit
    created_by UUID NOT NULL,
    completed_by UUID,

    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Indexes
CREATE INDEX idx_orders_tenant ON orders(tenant_id);
CREATE INDEX idx_orders_branch ON orders(tenant_id, branch_id);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_status ON orders(status);
```

#### Order Items Table

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,

    -- Product Reference
    product_id UUID NOT NULL,

    -- ✅ SNAPSHOT DATA (Immutable at order time)
    product_name VARCHAR(255) NOT NULL,
    product_name_en VARCHAR(255),
    product_sku VARCHAR(50),
    product_barcode VARCHAR(50),

    -- ✅ PRICE SNAPSHOT
    unit_price DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2),
    original_price DECIMAL(10,2),

    -- Quantity
    quantity INT NOT NULL,

    -- ✅ DISCOUNT SNAPSHOT
    discount_type VARCHAR(20),
    discount_value DECIMAL(10,2),
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_reason VARCHAR(255),
    discount_code VARCHAR(50),

    -- ✅ TAX SNAPSHOT
    tax_id UUID,
    tax_name VARCHAR(100),
    tax_rate DECIMAL(5,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    tax_inclusive BOOLEAN DEFAULT true,

    -- Totals
    subtotal DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,

    -- Modifiers Snapshot (JSON)
    modifiers JSONB,

    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
```

#### Audit Logs Table

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tenant & Branch
    tenant_id UUID NOT NULL,
    branch_id UUID,

    -- Who
    user_id UUID NOT NULL,
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    user_ip VARCHAR(45),
    user_agent TEXT,
    device_id VARCHAR(255),

    -- What
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    entity_name VARCHAR(255),

    -- Changes
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],

    -- Context
    reason TEXT,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,

    -- Request Info
    request_id UUID,
    endpoint VARCHAR(255),
    http_method VARCHAR(10),

    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);
```

---

## 🛡️ Authorization & Permission Matrix

### Permission Structure

```
permission = {resource}.{action}
```

### Permission Categories

| Category      | Permissions                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------- |
| **POS**       | `pos.sell`, `pos.refund`, `pos.void`, `pos.discount`, `pos.price_override`                  |
| **Orders**    | `orders.view`, `orders.create`, `orders.update`, `orders.cancel`, `orders.refund`           |
| **Inventory** | `inventory.view`, `inventory.adjust`, `inventory.transfer`, `inventory.count`               |
| **Products**  | `products.view`, `products.create`, `products.update`, `products.delete`                    |
| **Reports**   | `reports.view`, `reports.sales`, `reports.inventory`, `reports.financial`, `reports.export` |
| **Shifts**    | `shifts.open`, `shifts.close`, `shifts.cash_in`, `shifts.cash_out`, `shifts.view_all`       |
| **Settings**  | `settings.view`, `settings.update`, `settings.backup`                                       |
| **Users**     | `users.view`, `users.create`, `users.update`, `users.delete`, `users.permissions`           |

### Role-Permission Matrix

| Permission           | Owner | Admin | Manager  | Cashier | Viewer |
| -------------------- | :---: | :---: | :------: | :-----: | :----: |
| `pos.sell`           |  ✅   |  ✅   |    ✅    |   ✅    |   ❌   |
| `pos.refund`         |  ✅   |  ✅   |    ✅    |  ⚠️\*   |   ❌   |
| `pos.void`           |  ✅   |  ✅   |    ✅    |   ❌    |   ❌   |
| `pos.discount`       |  ✅   |  ✅   |    ✅    | ⚠️\*\*  |   ❌   |
| `pos.price_override` |  ✅   |  ✅   | ⚠️\*\*\* |   ❌    |   ❌   |
| `orders.refund`      |  ✅   |  ✅   |    ✅    |   ❌    |   ❌   |
| `shifts.open`        |  ✅   |  ✅   |    ✅    |   ✅    |   ❌   |
| `shifts.close`       |  ✅   |  ✅   |    ✅    |   ✅    |   ❌   |
| `shifts.cash_out`    |  ✅   |  ✅   |    ✅    |   ❌    |   ❌   |
| `inventory.adjust`   |  ✅   |  ✅   |    ✅    |   ❌    |   ❌   |
| `reports.financial`  |  ✅   |  ✅   |    ✅    |   ❌    |   ❌   |
| `settings.update`    |  ✅   |  ✅   |    ❌    |   ❌    |   ❌   |
| `users.permissions`  |  ✅   |  ✅   |    ❌    |   ❌    |   ❌   |

**Notes:**

- ⚠️\* Cashier: refund بحد أقصى (configurable)
- ⚠️\*\* Cashier: discount بحد أقصى `max_discount_percent`
- ⚠️\*\*\* Manager: price override بحد أقصى ±20%

### 🔒 Permission Constraint Details

تفاصيل القيود لكل صلاحية محدودة:

```json
{
  "permission_constraints": {
    "cashier.discount.apply_custom": {
      "max_percent": 10,
      "max_amount": 50,
      "requires_reason": true,
      "description": "الكاشير يمكنه تطبيق خصم حتى 10% أو 50 جنيه كحد أقصى"
    },
    "cashier.pos.refund": {
      "max_amount": 100,
      "time_limit_hours": 24,
      "same_shift_only": true,
      "requires_reason": true,
      "description": "الكاشير يمكنه استرجاع حتى 100 جنيه في نفس الوردية"
    },
    "supervisor.order.refund": {
      "max_amount": 500,
      "time_limit_hours": 48,
      "requires_reason": true,
      "description": "المشرف يمكنه استرجاع حتى 500 جنيه خلال 48 ساعة"
    },
    "supervisor.shift.cash_out": {
      "max_amount": 200,
      "requires_reason": true,
      "daily_limit": 500,
      "description": "المشرف يمكنه سحب حتى 200 جنيه بحد يومي 500 جنيه"
    },
    "supervisor.inventory.adjust": {
      "max_quantity": 50,
      "requires_reason": true,
      "description": "المشرف يمكنه تعديل حتى 50 وحدة"
    },
    "manager.product.update_price": {
      "max_change_percent": 20,
      "requires_approval_above": 30,
      "description": "المدير يمكنه تغيير السعر ±20%، فوق 30% يتطلب موافقة"
    },
    "manager.report.financial": {
      "own_branch_only": true,
      "description": "المدير يرى تقارير فرعه فقط"
    },
    "manager.user.update": {
      "same_or_lower_role_only": true,
      "own_branch_only": true,
      "description": "المدير يعدل موظفين بصلاحية أقل في فرعه"
    },
    "manager.settings.update": {
      "branch_settings_only": true,
      "excluded_settings": ["billing", "subscription", "integrations"],
      "description": "المدير يعدل إعدادات الفرع فقط"
    }
  }
}
```

### 🔐 Authorization Check Flow

```typescript
interface AuthorizationCheck {
  // Basic permission check
  hasPermission(permission: string): boolean;

  // Permission with constraints
  canPerform(action: string, context: ActionContext): AuthResult;

  // Specific checks
  canRefund(orderId: string, amount: number): AuthResult;
  canApplyDiscount(type: string, value: number): AuthResult;
  canAdjustInventory(productId: string, quantity: number): AuthResult;
}

interface AuthResult {
  allowed: boolean;
  reason?: string;
  constraints?: {
    max_amount?: number;
    requires_approval?: boolean;
    approver_role?: string;
  };
}
```

### Manager Approval Workflow

بعض العمليات تتطلب موافقة مدير:

```json
{
  "requires_manager_approval": [
    "refund_above_limit",
    "discount_above_limit",
    "price_override",
    "void_completed_order",
    "cash_out_large_amount"
  ],
  "approval_methods": ["pin_code", "fingerprint", "manager_login"]
}
```

### 📝 Authorization Error Response

```json
{
  "success": false,
  "error_code": "AUTHZ_PERMISSION_DENIED",
  "message": "غير مصرح بهذا الإجراء",
  "details": {
    "required_permission": "order.refund",
    "user_permissions": ["order.create", "order.view"],
    "constraint_violated": {
      "type": "max_amount",
      "limit": 500,
      "requested": 750
    },
    "suggestion": "يرجى طلب موافقة المدير للمبالغ أعلى من 500 جنيه"
  }
}
```

---

## ⚠️ Error Codes (أكواد الأخطاء)

### Standard Error Response

```json
{
  "success": false,
  "error_code": "NO_OPEN_SHIFT",
  "message": "يجب فتح وردية قبل إنشاء طلب",
  "details": {
    "branch_id": 1,
    "user_id": 2
  },
  "trace_id": "req_abc123"
}
```
```

### Error Code Categories

```typescript
enum ErrorCategory {
  AUTH = "1xxx", // Authentication & Authorization
  VALIDATION = "2xxx", // Input Validation
  BUSINESS = "3xxx", // Business Logic
  INVENTORY = "4xxx", // Inventory Related
  PAYMENT = "5xxx", // Payment Related
  SYNC = "6xxx", // Sync & Offline
  SYSTEM = "9xxx", // System Errors
}
```

### Complete Error Codes List

| Code | Constant | HTTP | Description (AR) | Description (EN) | Action Required |
| **🔐 Authentication Errors (1xxx)** |
| 1001 | `AUTH_INVALID_CREDENTIALS` | 401 | بيانات الدخول غير صحيحة | Invalid credentials | إعادة تسجيل الدخول |
| 1002 | `AUTH_TOKEN_EXPIRED` | 401 | انتهت صلاحية الجلسة | Session expired | تجديد التوكن |
| 1003 | `AUTH_TOKEN_INVALID` | 401 | جلسة غير صالحة | Invalid session | إعادة تسجيل الدخول |
| 1004 | `AUTH_ACCOUNT_LOCKED` | 401 | الحساب مقفل | Account locked | تواصل مع المدير |
| 1005 | `AUTH_ACCOUNT_DISABLED` | 401 | الحساب معطل | Account disabled | تواصل مع المدير |
| 1006 | `AUTH_MFA_REQUIRED` | 401 | مطلوب التحقق الثنائي | MFA required | أدخل رمز التحقق |
| 1007 | `AUTH_MFA_INVALID` | 401 | رمز التحقق غير صحيح | Invalid MFA code | أعد إدخال الرمز |
| 1008 | `AUTH_REFRESH_TOKEN_EXPIRED` | 401 | Refresh token منتهي | Refresh token expired | إعادة تسجيل الدخول |
| 1009 | `AUTH_PIN_INVALID` | 401 | رمز PIN غير صحيح | Invalid PIN code | أعد إدخال PIN |
| 1010 | `AUTHZ_PERMISSION_DENIED` | 403 | غير مصرح بهذا الإجراء | Permission denied | طلب صلاحية من المدير |
| 1011 | `AUTHZ_ROLE_INSUFFICIENT` | 403 | صلاحيات غير كافية | Insufficient role | تحتاج صلاحية أعلى |
| 1012 | `AUTHZ_BRANCH_ACCESS_DENIED` | 403 | لا يمكن الوصول لهذا الفرع | Branch access denied | سجل دخول للفرع الصحيح |
| 1013 | `AUTHZ_TENANT_MISMATCH` | 403 | خطأ في بيانات الشركة | Tenant mismatch | تحقق من الحساب |
| 1014 | `AUTHZ_MANAGER_APPROVAL_REQUIRED` | 403 | تتطلب موافقة مدير | Manager approval required | إدخال PIN المدير |
| **✅ Validation Errors (2xxx)** |
| 2001 | `VALIDATION_REQUIRED_FIELD` | 422 | حقل مطلوب | Required field | أكمل الحقول المطلوبة |
| 2002 | `VALIDATION_INVALID_FORMAT` | 422 | صيغة غير صحيحة | Invalid format | راجع تنسيق البيانات |
| 2003 | `VALIDATION_MIN_LENGTH` | 422 | الحد الأدنى للطول | Minimum length | أضف المزيد من الأحرف |
| 2004 | `VALIDATION_MAX_LENGTH` | 422 | تجاوز الحد الأقصى | Maximum length exceeded | قلل عدد الأحرف |
| 2005 | `VALIDATION_INVALID_EMAIL` | 422 | بريد إلكتروني غير صحيح | Invalid email | راجع البريد |
| 2006 | `VALIDATION_INVALID_PHONE` | 422 | رقم هاتف غير صحيح | Invalid phone | راجع الرقم |
| 2007 | `VALIDATION_DUPLICATE_VALUE` | 409 | القيمة موجودة مسبقاً | Duplicate value | استخدم قيمة مختلفة |
| 2008 | `VALIDATION_INVALID_DATE` | 422 | تاريخ غير صحيح | Invalid date | راجع التاريخ |
| 2009 | `VALIDATION_INVALID_AMOUNT` | 422 | مبلغ غير صحيح | Invalid amount | راجع المبلغ |
| 2010 | `VALIDATION_NEGATIVE_VALUE` | 422 | لا يمكن إدخال قيمة سالبة | Negative value not allowed | أدخل قيمة موجبة |
| **💼 Business Logic Errors (3xxx)** |
| 3001 | `ORDER_NOT_FOUND` | 404 | الطلب غير موجود | Order not found | تحقق من رقم الطلب |
| 3002 | `ORDER_ALREADY_COMPLETED` | 400 | الطلب مكتمل بالفعل | Order already completed | لا يمكن التعديل |
| 3003 | `ORDER_ALREADY_VOIDED` | 400 | الطلب ملغي بالفعل | Order already voided | - |
| 3004 | `ORDER_ALREADY_REFUNDED` | 400 | الطلب مسترجع بالفعل | Order already refunded | - |
| 3005 | `ORDER_CANNOT_MODIFY` | 400 | لا يمكن تعديل الطلب | Cannot modify order | راجع الحالة |
| 3006 | `ORDER_INVALID_STATE` | 400 | حالة الطلب لا تسمح بهذا الإجراء | Invalid order state | راجع lifecycle |
| 3007 | `ORDER_REFUND_EXPIRED` | 400 | انتهت مدة الاسترجاع | Refund period expired | تجاوز الوقت المسموح |
| 3008 | `ORDER_ITEMS_REQUIRED` | 400 | الطلب فارغ | Order items required | أضف منتجات |
| 3009 | `NO_OPEN_SHIFT` | 400 | يجب فتح وردية قبل إنشاء طلب | No open shift | افتح وردية أولاً |
| 3010 | `SHIFT_NOT_OPEN` | 400 | لا توجد وردية مفتوحة | No open shift | افتح وردية أولاً |
| 3011 | `SHIFT_ALREADY_OPEN` | 400 | توجد وردية مفتوحة بالفعل | Shift already open | أغلق الوردية الحالية |
| 3012 | `SHIFT_BELONGS_TO_OTHER` | 403 | الوردية تخص موظف آخر | Shift belongs to another | سجل دخول بحسابك |
| 3013 | `SHIFT_CASH_MISMATCH` | 400 | فرق في النقدية | Cash mismatch | راجع الحساب |
| 3020 | `DISCOUNT_INVALID_CODE` | 400 | كود الخصم غير صحيح | Invalid discount code | تحقق من الكود |
| 3021 | `DISCOUNT_EXPIRED` | 400 | انتهت صلاحية الخصم | Discount expired | - |
| 3022 | `DISCOUNT_USAGE_LIMIT` | 400 | تم استخدام الخصم بالكامل | Discount usage limit reached | - |
| 3023 | `DISCOUNT_MIN_ORDER` | 400 | الطلب أقل من الحد الأدنى | Order below minimum | زد قيمة الطلب |
| 3024 | `DISCOUNT_NOT_APPLICABLE` | 400 | الخصم لا ينطبق على هذه المنتجات | Discount not applicable | راجع شروط الخصم |
| 3025 | `DISCOUNT_EXCEEDS_LIMIT` | 400 | الخصم يتجاوز الحد المسموح | Discount exceeds limit | طلب موافقة مدير |
| 3030 | `TABLE_OCCUPIED` | 400 | الطاولة مشغولة | Table occupied | اختر طاولة أخرى |
| 3031 | `TABLE_NOT_FOUND` | 404 | الطاولة غير موجودة | Table not found | راجع رقم الطاولة |
| 3032 | `TABLE_ALREADY_FREE` | 400 | الطاولة فارغة بالفعل | Table already free | - |
| **📦 Inventory Errors (4xxx)** |
| 4001 | `INVENTORY_INSUFFICIENT` | 400 | الكمية غير متوفرة | Insufficient stock | راجع المخزون |
| 4002 | `INVENTORY_NEGATIVE` | 400 | لا يمكن أن يكون المخزون سالب | Negative inventory not allowed | راجع الإعدادات |
| 4003 | `INVENTORY_PRODUCT_NOT_FOUND` | 404 | المنتج غير موجود | Product not found | راجع المنتج |
| 4004 | `INVENTORY_BRANCH_MISMATCH` | 400 | المنتج غير متوفر في هذا الفرع | Product not in branch | راجع الفرع |
| 4005 | `INVENTORY_TRANSFER_SAME_BRANCH` | 400 | لا يمكن النقل لنفس الفرع | Cannot transfer to same branch | اختر فرع مختلف |
| 4006 | `INVENTORY_ADJUSTMENT_LIMIT` | 400 | تجاوز حد التعديل المسموح | Adjustment limit exceeded | طلب موافقة |
| 4007 | `INVENTORY_LOCKED` | 423 | المخزون مقفل (جرد جاري) | Inventory locked | انتظر انتهاء الجرد |
| **💳 Payment Errors (5xxx)** |
| 5001 | `PAYMENT_INSUFFICIENT` | 400 | المبلغ المدفوع أقل من المطلوب | Insufficient payment | راجع المبلغ |
| 5002 | `PAYMENT_METHOD_UNAVAILABLE` | 400 | طريقة الدفع غير متاحة | Payment method unavailable | اختر طريقة أخرى |
| 5003 | `PAYMENT_ALREADY_PROCESSED` | 400 | تم معالجة الدفع مسبقاً | Payment already processed | - |
| 5004 | `PAYMENT_REFUND_EXCEEDS` | 400 | مبلغ الاسترجاع أكبر من المدفوع | Refund exceeds payment | راجع المبلغ |
| 5005 | `PAYMENT_CARD_DECLINED` | 400 | تم رفض البطاقة | Card declined | جرب بطاقة أخرى |
| 5006 | `PAYMENT_TERMINAL_ERROR` | 500 | خطأ في جهاز الدفع | Terminal error | أعد المحاولة |
| 5007 | `PAYMENT_TIMEOUT` | 408 | انتهت مهلة الدفع | Payment timeout | أعد المحاولة |
| **🔄 Sync Errors (6xxx)** |
| 6001 | `SYNC_CONFLICT` | 409 | تعارض في البيانات | Data conflict | حل التعارض |
| 6002 | `SYNC_VERSION_MISMATCH` | 409 | إصدار البيانات غير متطابق | Version mismatch | pull ثم retry |
| 6003 | `SYNC_TOKEN_INVALID` | 400 | رمز المزامنة غير صالح | Invalid sync token | أعد المزامنة |
| 6004 | `SYNC_DEVICE_NOT_REGISTERED` | 400 | الجهاز غير مسجل | Device not registered | سجل الجهاز |
| 6005 | `SYNC_DATA_CORRUPTED` | 400 | بيانات تالفة | Data corrupted | أعد المزامنة |
| 6006 | `SYNC_OFFLINE_LIMIT` | 400 | تجاوز حد العمليات بدون اتصال | Offline limit exceeded | اتصل بالإنترنت |
| 6007 | `SYNC_RESOLUTION_REQUIRED` | 409 | مطلوب حل التعارض يدوياً | Manual resolution required | راجع التعارضات |
| **⚙️ System Errors (9xxx)** |
| 9001 | `SYSTEM_INTERNAL_ERROR` | 500 | خطأ في النظام | Internal error | تواصل مع الدعم |
| 9002 | `SYSTEM_DATABASE_ERROR` | 500 | خطأ في قاعدة البيانات | Database error | تواصل مع الدعم |
| 9003 | `SYSTEM_SERVICE_UNAVAILABLE` | 503 | الخدمة غير متاحة | Service unavailable | حاول لاحقاً |
| 9004 | `SYSTEM_RATE_LIMIT` | 429 | تجاوز الحد المسموح من الطلبات | Rate limit exceeded | انتظر |
| 9005 | `SYSTEM_MAINTENANCE` | 503 | النظام تحت الصيانة | System maintenance | انتظر |

---

## 📌 API Versioning Strategy

### Current Version

```
Base URL: https://api.kasserpro.com/v1
```

### Versioning Rules

| Change Type              | Version Impact     | Example                 |
| ------------------------ | ------------------ | ----------------------- |
| Add new endpoint         | ❌ No change       | `/v1/new-feature`       |
| Add optional field       | ❌ No change       | `"new_field": "value"`  |
| Add new enum value       | ❌ No change       | `status: "new_status"`  |
| Remove endpoint          | ⚠️ Deprecate first | Announce 6 months ahead |
| Remove field             | ⚠️ Deprecate first | Mark as deprecated      |
| Change field type        | 🔴 New version     | `/v2` required          |
| Change endpoint behavior | 🔴 New version     | `/v2` required          |

### Deprecation Policy

1. **Announcement**: 6 أشهر قبل الإزالة
2. **Warning Header**: `Deprecation: true`
3. **Sunset Header**: `Sunset: Sat, 01 Jan 2025 00:00:00 GMT`
4. **Documentation**: توثيق البديل

### Version Header

```http
API-Version: 2024-01-15
```

---

## 🔍 Audit Log & Data Ownership

### Audited Actions

كل العمليات الحساسة تُسجل في Audit Log:

| Action Category | Actions                                                  |
| --------------- | -------------------------------------------------------- |
| **Orders**      | create, update, complete, cancel, void, refund           |
| **Payments**    | create, refund                                           |
| **Inventory**   | adjust, transfer, count                                  |
| **Shifts**      | open, close, cash_in, cash_out                           |
| **Users**       | create, update, delete, login, logout, permission_change |
| **Settings**    | update                                                   |
| **Products**    | create, update, delete, price_change                     |

### Audit Log Structure

```json
{
  "id": 1,
  "tenant_id": 1,
  "branch_id": 1,
  "user_id": 2,
  "user_name": "أحمد محمد",
  "action": "Update",
  "entity_type": "Order",
  "entity_id": 123,
  "old_values": "{\"Status\":\"Draft\"}",
  "new_values": "{\"Status\":\"Completed\",\"CompletedAt\":\"2026-01-07T10:45:00Z\"}",
  "ip_address": "192.168.1.100",
  "created_at": "2026-01-07T10:45:00Z"
}
```

**ملاحظات:**
- `user_id` و `user_name` يُستخرجان من JWT claims
- `ip_address` يُستخرج من headers (X-Forwarded-For, X-Real-IP, أو RemoteIpAddress)
- `entity_id` للكيانات الجديدة يُحفظ بعد الإنشاء (في SavedChangesAsync)
```

### Data Ownership

| Entity               | Owner              | Can Modify      | Can Delete          |
| -------------------- | ------------------ | --------------- | ------------------- |
| Order                | Created by Cashier | Owner + Manager | Manager only (soft) |
| Payment              | Created by Cashier | ❌ Immutable    | ❌ Never            |
| Refund               | Created by Manager | ❌ Immutable    | ❌ Never            |
| Inventory Adjustment | Created by User    | ❌ Immutable    | ❌ Never            |
| Shift                | Opened by Cashier  | Owner only      | ❌ Never            |

---

## 📊 Performance & Limits

### Request Limits

| Limit Type             | Value      | Notes                     |
| ---------------------- | ---------- | ------------------------- |
| Max items per order    | 100        | قابل للتعديل في الإعدادات |
| Max modifiers per item | 20         |                           |
| Max orders per request | 50         | للـ bulk operations       |
| Max file upload size   | 5MB        | للصور والملفات            |
| Request body size      | 1MB        |                           |
| URL length             | 2048 chars |                           |

### Pagination Defaults

| Parameter  | Default | Max |
| ---------- | ------- | --- |
| `per_page` | 15      | 100 |
| `page`     | 1       | -   |

### Rate Limits

| Plan         | Requests/minute | Requests/day |
| ------------ | --------------- | ------------ |
| Basic        | 60              | 10,000       |
| Professional | 300             | 50,000       |
| Enterprise   | 1000            | Unlimited    |

### Rate Limit Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705312800
Retry-After: 30
```

### Response Time Targets

| Endpoint Type    | Target | Max     |
| ---------------- | ------ | ------- |
| Read (GET)       | 100ms  | 500ms   |
| Write (POST/PUT) | 200ms  | 1000ms  |
| Reports          | 500ms  | 5000ms  |
| Export           | 1000ms | 30000ms |

### 📊 System Limits (TypeScript Constants)

```typescript
const SYSTEM_LIMITS = {
  // Order Limits
  order: {
    max_items_per_order: 100,
    max_modifiers_per_item: 20,
    max_notes_length: 500,
    max_discount_percent: 100,
    max_held_orders_per_user: 10,
    max_held_orders_per_branch: 50,
  },

  // Product Limits
  product: {
    max_images: 10,
    max_image_size_mb: 5,
    max_modifiers_groups: 10,
    max_options_per_modifier: 30,
    max_name_length: 255,
    max_description_length: 2000,
  },

  // Inventory Limits
  inventory: {
    max_adjustment_quantity: 10000,
    max_transfer_items: 100,
    max_count_items: 500,
  },

  // Customer Limits
  customer: {
    max_credit_limit: 100000,
    max_loyalty_points: 1000000,
  },

  // Report Limits
  report: {
    max_date_range_days: 365,
    max_export_records: 50000,
  },

  // Sync Limits
  sync: {
    max_changes_per_push: 500,
    max_offline_days: 7,
    max_offline_orders: 1000,
  },
};
```

### 🔧 Performance Best Practices

```
┌─────────────────────────────────────────────────────────────────┐
│                 PERFORMANCE BEST PRACTICES                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DATABASE                                                     │
│     • Index on tenant_id + branch_id (composite)                 │
│     • Index on created_at for time-based queries                 │
│     • Partition large tables by tenant_id                        │
│     • Use read replicas for reports                              │
│                                                                  │
│  2. CACHING                                                      │
│     • Cache products & categories (5 min TTL)                    │
│     • Cache tax rates (1 hour TTL)                               │
│     • Cache user permissions (on login)                          │
│     • Invalidate on updates                                      │
│                                                                  │
│  3. API DESIGN                                                   │
│     • Use cursor pagination for large datasets                   │
│     • Support field selection (?fields=id,name,price)            │
│     • Support eager loading (?include=items,customer)            │
│     • Compress responses (gzip)                                  │
│                                                                  │
│  4. OFFLINE                                                      │
│     • Sync only changed data (delta sync)                        │
│     • Batch sync operations                                      │
│     • Compress sync payloads                                     │
│     • Background sync when online                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 معلومات عامة

### Headers المطلوبة

```http
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: application/json
Accept-Language: ar|en
X-Tenant-Id: {tenant_id}      # مطلوب - لتحديد الشركة
X-Branch-Id: {branch_id}      # مطلوب - لتحديد الفرع (يمكن تبديله للتنقل بين الفروع)
X-Device-Id: {device_uuid}    # مطلوب للـ POS
Idempotency-Key: {uuid}       # مطلوب للعمليات الحساسة
```

### 🔄 تبديل الفرع (Branch Switching)

يمكن للمستخدم التنقل بين الفروع المصرح له بها عبر تغيير `X-Branch-Id` header:

```http
X-Branch-Id: 2
```

**ملاحظات:**
- يتم التحقق من صلاحية المستخدم للوصول للفرع المحدد
- جميع العمليات (الطلبات، الورديات، التقارير) تُفلتر تلقائياً حسب الفرع المحدد
- يتم استخدام `ICurrentUserService` في الـ Backend لاستخراج TenantId و BranchId من الـ JWT و Headers

### 🕐 المنطقة الزمنية (Timezone)

- **Backend**: يخزن جميع التواريخ بتوقيت UTC
- **Frontend**: يعرض التواريخ بتوقيت القاهرة (Africa/Cairo)
- **تحويل التاريخ**: استخدم `parseApiDate()` helper لتحويل التواريخ من UTC إلى توقيت القاهرة

```typescript
// Frontend: تحويل التاريخ من UTC إلى توقيت القاهرة
const cairoDate = new Date(utcDate).toLocaleString('ar-EG', {
  timeZone: 'Africa/Cairo'
});
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  },
  "error_code": "VALIDATION_ERROR"
}
```

### Pagination Response

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7,
    "from": 1,
    "to": 15
  },
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": "..."
  }
}
```

---

## 1. 🔐 Authentication (المصادقة)

### POST `/api/auth/login`

تسجيل الدخول

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "device_id": "optional-device-id",
  "device_name": "Chrome Browser"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "def50200...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "name": "أحمد محمد",
      "email": "user@example.com",
      "role": "cashier",
      "branch_id": 1,
      "permissions": ["pos.sell", "pos.refund", "reports.view"]
    }
  }
}
```

---

### POST `/api/auth/logout`

تسجيل الخروج

**Request:**

```json
{
  "refresh_token": "def50200..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح"
}
```

---

### POST `/api/auth/refresh`

تجديد التوكن

**Request:**

```json
{
  "refresh_token": "def50200..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "access_token": "new_token...",
    "expires_in": 3600
  }
}
```

---

### GET `/api/auth/me`

الحصول على بيانات المستخدم الحالي

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "أحمد محمد",
    "email": "user@example.com",
    "phone": "+966501234567",
    "role": {
      "id": 2,
      "name": "cashier",
      "display_name": "كاشير"
    },
    "branches": [{ "id": 1, "name": "الفرع الرئيسي" }],
    "permissions": ["pos.sell", "pos.refund"],
    "settings": {
      "language": "ar",
      "theme": "light"
    }
  }
}
```

---

### POST `/api/auth/forgot-password`

نسيت كلمة المرور

**Request:**

```json
{
  "email": "user@example.com"
}
```

---

### POST `/api/auth/reset-password`

إعادة تعيين كلمة المرور

**Request:**

```json
{
  "token": "reset_token",
  "email": "user@example.com",
  "password": "new_password",
  "password_confirmation": "new_password"
}
```

---

## 2. 🏢 Tenants (الشركات/المستأجرين)

### GET `/api/tenants/current`

بيانات الشركة الحالية

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "مطعم السعادة",
    "name_en": "Happiness Restaurant",
    "slug": "happiness-restaurant",
    "logo_url": "https://...",
    "business_type": "restaurant",
    "subscription": {
      "plan": "professional",
      "status": "active",
      "started_at": "2024-01-01",
      "expires_at": "2025-01-01",
      "features": ["multi_branch", "kitchen_display", "offline_mode"]
    },
    "limits": {
      "max_branches": 10,
      "max_users": 50,
      "max_products": 1000
    },
    "settings": {
      "currency": "EGP",
      "timezone": "Africa/Cairo",
      "language": "ar"
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### PUT `/api/tenants/current`

تحديث بيانات الشركة

**Request:**

```json
{
  "name": "مطعم السعادة المحدثة",
  "name_en": "Updated Happiness Restaurant",
  "logo": "base64_or_url",
  "settings": {
    "currency": "EGP",
    "timezone": "Africa/Cairo"
  }
}
```

---

### GET `/api/tenants/subscription`

تفاصيل الاشتراك

**Response:**

```json
{
  "success": true,
  "data": {
    "plan": {
      "id": "professional",
      "name": "الخطة الاحترافية",
      "price": 499.0,
      "billing_cycle": "monthly"
    },
    "status": "active",
    "current_period": {
      "start": "2024-01-01",
      "end": "2024-02-01"
    },
    "usage": {
      "branches": { "used": 3, "limit": 10 },
      "users": { "used": 15, "limit": 50 },
      "products": { "used": 250, "limit": 1000 },
      "orders_this_month": 1500
    },
    "payment_method": {
      "type": "card",
      "last_four": "4242",
      "brand": "visa"
    },
    "invoices": [
      {
        "id": 1,
        "amount": 499.0,
        "status": "paid",
        "date": "2024-01-01",
        "download_url": "https://..."
      }
    ]
  }
}
```

---

## 3. 👥 Users & Employees (المستخدمين والموظفين)

### GET `/api/users`

قائمة المستخدمين

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `role` | string | فلترة حسب الدور (admin, manager, cashier) |
| `branch_id` | integer | فلترة حسب الفرع |
| `status` | string | active, inactive |
| `search` | string | البحث بالاسم أو الإيميل |
| `per_page` | integer | عدد النتائج (default: 15) |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "phone": "+966501234567",
      "role": {
        "id": 2,
        "name": "cashier",
        "display_name": "كاشير"
      },
      "branches": [
        { "id": 1, "name": "الفرع الرئيسي" }
      ],
      "status": "active",
      "last_login_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### POST `/api/users`

إنشاء مستخدم جديد

**Request:**

```json
{
  "first_name": "أحمد",
  "last_name": "محمد",
  "email": "ahmed@example.com",
  "phone": "+966501234567",
  "password": "password123",
  "role_id": 2,
  "branch_ids": [1, 2],
  "status": "active",
  "permissions": ["pos.sell", "pos.refund"],
  "pin_code": "1234",
  "commission_rate": 5.0,
  "max_discount_percent": 10
}
```

---

### GET `/api/users/{id}`

تفاصيل مستخدم

---

### PUT `/api/users/{id}`

تحديث مستخدم

---

### DELETE `/api/users/{id}`

حذف مستخدم

---

### GET `/api/users/{id}/permissions`

صلاحيات المستخدم

---

### PUT `/api/users/{id}/permissions`

تحديث صلاحيات المستخدم

**Request:**

```json
{
  "permissions": [
    "pos.sell",
    "pos.refund",
    "pos.discount",
    "reports.view",
    "inventory.view"
  ]
}
```

---

### GET `/api/roles`

قائمة الأدوار

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "admin",
      "display_name": "مدير النظام",
      "permissions": ["*"]
    },
    {
      "id": 2,
      "name": "manager",
      "display_name": "مدير فرع",
      "permissions": ["pos.*", "reports.*", "inventory.*"]
    },
    {
      "id": 3,
      "name": "cashier",
      "display_name": "كاشير",
      "permissions": ["pos.sell", "pos.refund"]
    }
  ]
}
```

---

## 4. 🏢 Branches/Locations (الفروع)

### GET `/api/branches`

قائمة الفروع

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | active, inactive |
| `city` | string | فلترة حسب المدينة |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "الفرع الرئيسي",
      "code": "BR001",
      "address": "شارع الملك فهد، الرياض",
      "city": "الرياض",
      "phone": "+966112345678",
      "email": "main@kasserpro.com",
      "tax_number": "300000000000003",
      "is_active": true,
      "working_hours": {
        "saturday": { "open": "09:00", "close": "23:00" },
        "sunday": { "open": "09:00", "close": "23:00" }
      },
      "settings": {
        "receipt_header": "مرحباً بكم",
        "receipt_footer": "شكراً لزيارتكم",
        "default_tax_id": 1,
        "currency": "EGP"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/api/branches`

إنشاء فرع جديد

**Request:**

```json
{
  "name": "فرع جدة",
  "code": "BR002",
  "address": "شارع التحلية، جدة",
  "city": "جدة",
  "state": "منطقة مكة",
  "country": "SA",
  "postal_code": "21589",
  "phone": "+966122345678",
  "email": "jeddah@kasserpro.com",
  "tax_number": "300000000000004",
  "is_active": true,
  "working_hours": {
    "saturday": { "open": "09:00", "close": "23:00", "is_closed": false },
    "friday": { "open": "14:00", "close": "23:00", "is_closed": false }
  },
  "settings": {
    "receipt_header": "فرع جدة - مرحباً بكم",
    "receipt_footer": "شكراً لزيارتكم",
    "default_tax_id": 1,
    "auto_print_receipt": true,
    "require_customer": false
  }
}
```

---

### GET `/api/branches/{id}`

تفاصيل فرع

---

### PUT `/api/branches/{id}`

تحديث فرع

---

### DELETE `/api/branches/{id}`

حذف فرع

---

### GET `/api/branches/{id}/settings`

إعدادات الفرع

---

### PUT `/api/branches/{id}/settings`

تحديث إعدادات الفرع

**Request:**

```json
{
  "receipt_settings": {
    "header": "مرحباً بكم في كاشير برو",
    "footer": "شكراً لزيارتكم - نتمنى لكم يوماً سعيداً",
    "logo_url": "https://...",
    "show_tax_details": true,
    "show_cashier_name": true,
    "paper_size": "80mm"
  },
  "pos_settings": {
    "default_tax_id": 1,
    "auto_print_receipt": true,
    "require_customer": false,
    "allow_negative_stock": false,
    "default_payment_method": "cash"
  },
  "notification_settings": {
    "low_stock_alert": true,
    "low_stock_threshold": 10,
    "daily_report_email": true
  }
}
```

---

## 5. 📦 Products (المنتجات)

### GET `/api/products`

قائمة المنتجات

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category_id` | integer | فلترة حسب التصنيف |
| `branch_id` | integer | فلترة حسب الفرع |
| `status` | string | active, inactive, out_of_stock |
| `search` | string | البحث بالاسم أو الباركود |
| `type` | string | simple, variable, combo |
| `is_featured` | boolean | المنتجات المميزة |
| `per_page` | integer | عدد النتائج |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "برجر كلاسيك",
      "name_en": "Classic Burger",
      "sku": "BRG001",
      "barcode": "6281000000001",
      "description": "برجر لحم طازج مع الخضار",
      "type": "simple",
      "category": {
        "id": 1,
        "name": "البرجر"
      },
      "price": 25.00,
      "cost": 12.00,
      "tax_id": 1,
      "tax_inclusive": true,
      "unit": "piece",
      "image_url": "https://...",
      "images": ["https://..."],
      "is_active": true,
      "is_featured": true,
      "track_stock": true,
      "stock_quantity": 50,
      "low_stock_threshold": 10,
      "modifiers": [
        { "id": 1, "name": "الإضافات" }
      ],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### POST `/api/products`

إنشاء منتج جديد

**Request:**

```json
{
  "name": "برجر دجاج",
  "name_en": "Chicken Burger",
  "sku": "BRG002",
  "barcode": "6281000000002",
  "description": "برجر دجاج مقرمش",
  "type": "simple",
  "category_id": 1,
  "price": 22.0,
  "cost": 10.0,
  "tax_id": 1,
  "tax_inclusive": true,
  "unit": "piece",
  "image": "base64_or_url",
  "is_active": true,
  "is_featured": false,
  "track_stock": true,
  "initial_stock": 100,
  "low_stock_threshold": 10,
  "modifier_ids": [1, 2],
  "branch_prices": [
    { "branch_id": 1, "price": 22.0 },
    { "branch_id": 2, "price": 24.0 }
  ]
}
```

---

### GET `/api/products/{id}`

تفاصيل منتج

---

### PUT `/api/products/{id}`

تحديث منتج

---

### DELETE `/api/products/{id}`

حذف منتج

---

### GET `/api/products/barcode/{barcode}`

البحث بالباركود

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "برجر كلاسيك",
    "barcode": "6281000000001",
    "price": 25.0,
    "stock_quantity": 50,
    "image_url": "https://..."
  }
}
```

---

### POST `/api/products/bulk-update`

تحديث جماعي للمنتجات

**Request:**

```json
{
  "product_ids": [1, 2, 3],
  "updates": {
    "category_id": 2,
    "is_active": true,
    "price_adjustment": {
      "type": "percentage",
      "value": 10
    }
  }
}
```

---

### GET `/api/products/{id}/stock`

مخزون المنتج في كل الفروع

**Response:**

```json
{
  "success": true,
  "data": {
    "product_id": 1,
    "product_name": "برجر كلاسيك",
    "total_stock": 150,
    "branches": [
      { "branch_id": 1, "branch_name": "الفرع الرئيسي", "quantity": 100 },
      { "branch_id": 2, "branch_name": "فرع جدة", "quantity": 50 }
    ]
  }
}
```

---

## 6. 📂 Categories (التصنيفات)

### GET `/api/categories`

قائمة التصنيفات

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `parent_id` | integer | التصنيفات الفرعية |
| `status` | string | active, inactive |
| `with_products` | boolean | تضمين المنتجات |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "البرجر",
      "name_en": "Burgers",
      "slug": "burgers",
      "description": "جميع أنواع البرجر",
      "image_url": "https://...",
      "color": "#FF5722",
      "icon": "burger",
      "parent_id": null,
      "sort_order": 1,
      "is_active": true,
      "products_count": 15,
      "children": [
        {
          "id": 5,
          "name": "برجر لحم",
          "parent_id": 1
        }
      ],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/api/categories`

إنشاء تصنيف

**Request:**

```json
{
  "name": "المشروبات",
  "name_en": "Beverages",
  "description": "المشروبات الباردة والساخنة",
  "parent_id": null,
  "image": "base64_or_url",
  "color": "#2196F3",
  "icon": "drink",
  "sort_order": 2,
  "is_active": true
}
```

---

### GET `/api/categories/{id}`

تفاصيل تصنيف

---

### PUT `/api/categories/{id}`

تحديث تصنيف

---

### DELETE `/api/categories/{id}`

حذف تصنيف

---

### PUT `/api/categories/reorder`

إعادة ترتيب التصنيفات

**Request:**

```json
{
  "categories": [
    { "id": 1, "sort_order": 1 },
    { "id": 2, "sort_order": 2 },
    { "id": 3, "sort_order": 3 }
  ]
}
```

---

## 7. 📊 Inventory (المخزون)

### GET `/api/inventory`

قائمة المخزون

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `branch_id` | integer | فلترة حسب الفرع |
| `category_id` | integer | فلترة حسب التصنيف |
| `status` | string | in_stock, low_stock, out_of_stock |
| `search` | string | البحث |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "برجر كلاسيك",
        "sku": "BRG001"
      },
      "branch": {
        "id": 1,
        "name": "الفرع الرئيسي"
      },
      "quantity": 50,
      "reserved_quantity": 5,
      "available_quantity": 45,
      "low_stock_threshold": 10,
      "status": "in_stock",
      "last_restock_at": "2024-01-10T00:00:00Z",
      "updated_at": "2024-01-15T00:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### POST `/api/inventory/adjust`

تعديل المخزون

**Request:**

```json
{
  "branch_id": 1,
  "adjustments": [
    {
      "product_id": 1,
      "quantity": 10,
      "type": "add",
      "reason": "restock",
      "notes": "توريد جديد"
    },
    {
      "product_id": 2,
      "quantity": 5,
      "type": "subtract",
      "reason": "damaged",
      "notes": "منتجات تالفة"
    }
  ],
  "reference_number": "ADJ-001"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "adjustment_id": 1,
    "reference_number": "ADJ-001",
    "total_items": 2,
    "adjustments": [
      {
        "product_id": 1,
        "previous_quantity": 40,
        "new_quantity": 50,
        "change": 10
      }
    ]
  }
}
```

---

### POST `/api/inventory/transfer`

نقل مخزون بين الفروع

**Request:**

```json
{
  "from_branch_id": 1,
  "to_branch_id": 2,
  "items": [
    { "product_id": 1, "quantity": 20 },
    { "product_id": 2, "quantity": 15 }
  ],
  "notes": "نقل للفرع الجديد",
  "reference_number": "TRF-001"
}
```

---

### GET `/api/inventory/transfers`

قائمة عمليات النقل

---

### GET `/api/inventory/transfers/{id}`

تفاصيل عملية نقل

---

### GET `/api/inventory/history`

سجل حركة المخزون

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `product_id` | integer | فلترة حسب المنتج |
| `branch_id` | integer | فلترة حسب الفرع |
| `type` | string | sale, purchase, adjustment, transfer |
| `from_date` | date | من تاريخ |
| `to_date` | date | إلى تاريخ |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "برجر كلاسيك",
      "branch_id": 1,
      "type": "sale",
      "quantity_change": -2,
      "quantity_before": 52,
      "quantity_after": 50,
      "reference_type": "order",
      "reference_id": 123,
      "notes": "طلب #123",
      "user": {
        "id": 1,
        "name": "أحمد"
      },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### GET `/api/inventory/low-stock`

المنتجات منخفضة المخزون

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "product_id": 1,
      "product_name": "برجر كلاسيك",
      "branch_id": 1,
      "branch_name": "الفرع الرئيسي",
      "current_quantity": 8,
      "threshold": 10,
      "status": "low_stock"
    }
  ]
}
```

---

### POST `/api/inventory/count`

جرد المخزون

**Request:**

```json
{
  "branch_id": 1,
  "items": [
    { "product_id": 1, "counted_quantity": 48 },
    { "product_id": 2, "counted_quantity": 100 }
  ],
  "notes": "جرد شهري"
}
```

---

## 8. 🛒 Orders/Sales (الطلبات/المبيعات)

### ⚠️ متطلبات إنشاء الطلب

قبل إنشاء أي طلب، يجب التحقق من:

1. **وردية مفتوحة**: يجب أن يكون للمستخدم وردية مفتوحة في الفرع الحالي
2. **ربط الطلب بالوردية**: كل طلب يُربط تلقائياً بالوردية المفتوحة (`shift_id`)

```json
// خطأ: لا توجد وردية مفتوحة
{
  "success": false,
  "error_code": "NO_OPEN_SHIFT",
  "message": "يجب فتح وردية قبل إنشاء طلب"
}
```

### GET `/api/orders`

قائمة الطلبات

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `branch_id` | integer | فلترة حسب الفرع |
| `status` | string | pending, completed, cancelled, refunded |
| `payment_status` | string | paid, unpaid, partial |
| `order_type` | string | dine_in, takeaway, delivery |
| `customer_id` | integer | فلترة حسب العميل |
| `cashier_id` | integer | فلترة حسب الكاشير |
| `from_date` | date | من تاريخ |
| `to_date` | date | إلى تاريخ |
| `search` | string | البحث برقم الطلب |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "order_number": "ORD-2024-00123",
      "branch": {
        "id": 1,
        "name": "الفرع الرئيسي"
      },
      "customer": {
        "id": 1,
        "name": "محمد أحمد",
        "phone": "+966501234567"
      },
      "cashier": {
        "id": 2,
        "name": "أحمد"
      },
      "order_type": "dine_in",
      "table": {
        "id": 5,
        "name": "طاولة 5"
      },
      "status": "completed",
      "payment_status": "paid",
      "items": [
        {
          "id": 1,
          "product_id": 1,
          "product_name": "برجر كلاسيك",
          "quantity": 2,
          "unit_price": 25.00,
          "discount": 0,
          "tax": 3.75,
          "total": 53.75,
          "modifiers": [
            {
              "id": 1,
              "name": "جبنة إضافية",
              "price": 3.00
            }
          ],
          "notes": "بدون بصل"
        }
      ],
      "subtotal": 50.00,
      "discount_amount": 0,
      "discount_type": null,
      "tax_amount": 7.50,
      "total": 57.50,
      "payments": [
        {
          "method": "cash",
          "amount": 57.50,
          "reference": null
        }
      ],
      "notes": "طلب سريع",
      "created_at": "2024-01-15T10:30:00Z",
      "completed_at": "2024-01-15T10:45:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### POST `/api/orders`

إنشاء طلب جديد (الأهم في نظام الكاشير)

**⚠️ متطلبات:**
- يجب أن يكون للمستخدم وردية مفتوحة في الفرع الحالي
- الطلب يُربط تلقائياً بالوردية المفتوحة

**Request:**

```json
{
  "customer_id": 1,
  "customer_name": "محمد أحمد",
  "customer_phone": "+201234567890",
  "order_type": "dine_in",
  "table_id": 5,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "modifiers": [{ "modifier_option_id": 1, "quantity": 1 }],
      "notes": "بدون بصل"
    },
    {
      "product_id": 3,
      "quantity": 1
    }
  ],
  "notes": "طلب مستعجل"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 124,
    "order_number": "ORD-20260107-ABC123",
    "status": "Draft",
    "order_type": "dine_in",
    "shift_id": 5,
    "branch_id": 1,
    "branch_name": "الفرع الرئيسي",
    "branch_address": "القاهرة، مصر",
    "branch_phone": "+20223456789",
    "user_id": 2,
    "user_name": "أحمد محمد",
    "currency_code": "EGP",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "برجر كلاسيك",
        "product_name_en": "Classic Burger",
        "product_sku": "BRG001",
        "product_barcode": "6281000000001",
        "unit_price": 25.00,
        "original_price": 25.00,
        "quantity": 2,
        "tax_rate": 14.0,
        "tax_amount": 6.14,
        "tax_inclusive": true,
        "subtotal": 50.00,
        "total": 50.00
      }
    ],
    "subtotal": 65.0,
    "discount_amount": 0,
    "tax_amount": 7.98,
    "total": 65.0,
    "amount_paid": 0,
    "amount_due": 65.0,
    "created_at": "2026-01-07T11:00:00Z"
  },
  "message": "تم إنشاء الطلب بنجاح"
}
```

**Snapshots المحفوظة:**
- **Branch Snapshot**: `branch_name`, `branch_address`, `branch_phone`
- **User Snapshot**: `user_name`
- **Product Snapshot**: `product_name`, `product_name_en`, `product_sku`, `product_barcode`, `unit_price`, `original_price`
- **Tax Snapshot**: `tax_rate`, `tax_amount`, `tax_inclusive`

---

### POST `/api/orders/{id}/complete`

إكمال الطلب مع الدفع

**Request:**

```json
{
  "payments": [
    {
      "method": "Cash",
      "amount": 50.0
    },
    {
      "method": "Card",
      "amount": 15.0,
      "reference": "TXN123456"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 124,
    "order_number": "ORD-20260107-ABC123",
    "status": "Completed",
    "total": 65.0,
    "amount_paid": 65.0,
    "amount_due": 0,
    "change_amount": 0,
    "completed_at": "2026-01-07T11:15:00Z"
  },
  "message": "تم إتمام الدفع وإغلاق الطلب"
}
```

---

### GET `/api/orders/{id}`

تفاصيل طلب

---

### PUT `/api/orders/{id}`

تحديث طلب (قبل الإكمال)

---

### POST `/api/orders/{id}/cancel`

إلغاء طلب

**Request:**

```json
{
  "reason": "طلب العميل الإلغاء",
  "refund_payment": true
}
```

---

### POST `/api/orders/{id}/refund`

استرجاع طلب

**Request:**

```json
{
  "type": "full",
  "reason": "منتج غير مطابق",
  "items": [{ "order_item_id": 1, "quantity": 1 }],
  "refund_method": "cash",
  "return_to_stock": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "refund_id": 1,
    "order_id": 123,
    "refund_amount": 25.0,
    "refund_method": "cash",
    "status": "completed"
  }
}
```

---

### GET `/api/orders/{id}/receipt`

طباعة الفاتورة

**Response:**

```json
{
  "success": true,
  "data": {
    "receipt_html": "<html>...</html>",
    "receipt_url": "https://...",
    "qr_code": "base64..."
  }
}
```

---

### POST `/api/orders/hold`

تعليق طلب

**Request:**

```json
{
  "branch_id": 1,
  "items": [...],
  "customer_id": 1,
  "table_id": 5,
  "notes": "العميل سيعود"
}
```

---

### GET `/api/orders/held`

الطلبات المعلقة

---

### POST `/api/orders/held/{id}/resume`

استئناف طلب معلق

---

### DELETE `/api/orders/held/{id}`

حذف طلب معلق

---

## 9. 💳 Payments (المدفوعات)

### GET `/api/payment-methods`

طرق الدفع المتاحة

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "cash",
      "name": "نقدي",
      "name_en": "Cash",
      "icon": "cash",
      "is_active": true,
      "requires_reference": false,
      "settings": {}
    },
    {
      "id": 2,
      "code": "card",
      "name": "بطاقة ائتمان",
      "name_en": "Credit Card",
      "icon": "credit-card",
      "is_active": true,
      "requires_reference": true,
      "settings": {
        "terminal_id": "T001"
      }
    },
    {
      "id": 3,
      "code": "fawry",
      "name": "فوري",
      "name_en": "Fawry",
      "icon": "fawry",
      "is_active": true,
      "requires_reference": true
    },
    {
      "id": 4,
      "code": "apple_pay",
      "name": "Apple Pay",
      "icon": "apple",
      "is_active": true
    },
    {
      "id": 5,
      "code": "stc_pay",
      "name": "STC Pay",
      "icon": "stc",
      "is_active": true
    }
  ]
}
```

---

### POST `/api/payments`

تسجيل دفعة

**Request:**

```json
{
  "order_id": 123,
  "method": "card",
  "amount": 57.5,
  "reference": "TXN123456",
  "notes": ""
}
```

---

### GET `/api/payments`

قائمة المدفوعات

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `branch_id` | integer | فلترة حسب الفرع |
| `method` | string | cash, card, fawry, etc. |
| `from_date` | date | من تاريخ |
| `to_date` | date | إلى تاريخ |

---

### POST `/api/payments/refund`

استرجاع دفعة

**Request:**

```json
{
  "payment_id": 1,
  "amount": 25.0,
  "reason": "استرجاع جزئي"
}
```

---

### GET `/api/payments/summary`

ملخص المدفوعات

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `branch_id` | integer | الفرع |
| `date` | date | التاريخ |
| `shift_id` | integer | الوردية |

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 15000.0,
    "by_method": [
      { "method": "cash", "amount": 8000.0, "count": 45 },
      { "method": "card", "amount": 5000.0, "count": 30 },
      { "method": "fawry", "amount": 2000.0, "count": 15 }
    ],
    "refunds": {
      "total": 500.0,
      "count": 3
    }
  }
}
```

---

## 10. 👤 Customers (العملاء)

### GET `/api/customers`

قائمة العملاء

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | البحث بالاسم أو الهاتف |
| `group_id` | integer | فلترة حسب المجموعة |
| `has_credit` | boolean | العملاء بآجل |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "محمد أحمد",
      "email": "mohammed@example.com",
      "phone": "+966501234567",
      "group": {
        "id": 1,
        "name": "VIP",
        "discount_percent": 10
      },
      "total_orders": 25,
      "total_spent": 2500.00,
      "credit_balance": 0,
      "loyalty_points": 250,
      "notes": "عميل مميز",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### POST `/api/customers`

إنشاء عميل

**Request:**

```json
{
  "name": "أحمد علي",
  "email": "ahmed@example.com",
  "phone": "+966509876543",
  "group_id": 1,
  "address": "الرياض، حي النخيل",
  "notes": "",
  "credit_limit": 1000.0
}
```

---

### GET `/api/customers/{id}`

تفاصيل عميل

---

### PUT `/api/customers/{id}`

تحديث عميل

---

### DELETE `/api/customers/{id}`

حذف عميل

---

### GET `/api/customers/{id}/orders`

طلبات العميل

---

### GET `/api/customers/{id}/transactions`

معاملات العميل المالية

---

### POST `/api/customers/{id}/credit`

إضافة رصيد آجل

**Request:**

```json
{
  "amount": 500.0,
  "type": "add",
  "notes": "دفعة مقدمة"
}
```

---

### GET `/api/customers/search`

بحث سريع عن عميل

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | رقم الهاتف أو الاسم |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "محمد أحمد",
      "phone": "+966501234567",
      "group_name": "VIP",
      "discount_percent": 10
    }
  ]
}
```

---

### GET `/api/customer-groups`

مجموعات العملاء

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "VIP",
      "discount_percent": 10,
      "customers_count": 50
    },
    {
      "id": 2,
      "name": "عادي",
      "discount_percent": 0,
      "customers_count": 200
    }
  ]
}
```

---

### POST `/api/customer-groups`

إنشاء مجموعة عملاء

---

## 11. 🏷️ Discounts & Promotions (الخصومات والعروض)

### GET `/api/discounts`

قائمة الخصومات

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "خصم الافتتاح",
      "code": "OPEN20",
      "type": "percentage",
      "value": 20,
      "min_order_amount": 50.0,
      "max_discount_amount": 100.0,
      "usage_limit": 100,
      "usage_count": 45,
      "per_customer_limit": 1,
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "is_active": true,
      "applicable_to": "all",
      "product_ids": [],
      "category_ids": [],
      "customer_group_ids": [],
      "branch_ids": [1, 2],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/api/discounts`

إنشاء خصم

**Request:**

```json
{
  "name": "خصم نهاية الأسبوع",
  "code": "WEEKEND15",
  "type": "percentage",
  "value": 15,
  "min_order_amount": 100.0,
  "max_discount_amount": 50.0,
  "usage_limit": null,
  "per_customer_limit": 2,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "is_active": true,
  "applicable_to": "specific_categories",
  "category_ids": [1, 2],
  "branch_ids": [1],
  "days_of_week": ["friday", "saturday"]
}
```

---

### GET `/api/discounts/{id}`

تفاصيل خصم

---

### PUT `/api/discounts/{id}`

تحديث خصم

---

### DELETE `/api/discounts/{id}`

حذف خصم

---

### POST `/api/discounts/validate`

التحقق من كود الخصم

**Request:**

```json
{
  "code": "OPEN20",
  "order_amount": 150.0,
  "customer_id": 1,
  "branch_id": 1,
  "items": [{ "product_id": 1, "quantity": 2 }]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount_id": 1,
    "discount_name": "خصم الافتتاح",
    "discount_type": "percentage",
    "discount_value": 20,
    "calculated_discount": 30.0,
    "message": "تم تطبيق الخصم بنجاح"
  }
}
```

---

### GET `/api/promotions`

العروض الترويجية

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "اشتري 2 واحصل على 1 مجاناً",
      "type": "buy_x_get_y",
      "buy_quantity": 2,
      "get_quantity": 1,
      "product_ids": [1, 2, 3],
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "is_active": true
    },
    {
      "id": 2,
      "name": "وجبة كومبو",
      "type": "bundle",
      "bundle_price": 45.0,
      "original_price": 60.0,
      "items": [
        { "product_id": 1, "quantity": 1 },
        { "product_id": 5, "quantity": 1 },
        { "product_id": 10, "quantity": 1 }
      ],
      "is_active": true
    }
  ]
}
```

---

### POST `/api/promotions`

إنشاء عرض ترويجي

---

## 12. 💰 Cash Register/Shifts (الكاشير/الورديات)

### 🔗 ربط الطلبات بالورديات

كل طلب يُنشأ يُربط تلقائياً بالوردية المفتوحة للمستخدم في الفرع الحالي:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Shift-Order Relationship                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Shift (وردية)                                                   │
│  ├── id: 5                                                       │
│  ├── user_id: 2                                                  │
│  ├── branch_id: 1                                                │
│  ├── is_closed: false                                            │
│  └── orders: [                                                   │
│        ├── Order #1 (shift_id: 5, status: Completed)             │
│        ├── Order #2 (shift_id: 5, status: Completed)             │
│        └── Order #3 (shift_id: 5, status: Draft)                 │
│      ]                                                           │
│                                                                  │
│  عند إغلاق الوردية:                                              │
│  - total_orders = عدد الطلبات المكتملة (Completed)               │
│  - total_cash = مجموع المدفوعات النقدية                          │
│  - total_card = مجموع المدفوعات بالبطاقة                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### POST `/api/shifts/open`

فتح وردية

**Request:**

```json
{
  "branch_id": 1,
  "register_id": 1,
  "opening_cash": 500.0,
  "notes": "وردية صباحية"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "shift_number": "SH-2024-001",
    "branch_id": 1,
    "register_id": 1,
    "user_id": 2,
    "user_name": "أحمد",
    "opening_cash": 500.0,
    "status": "open",
    "opened_at": "2024-01-15T08:00:00Z"
  },
  "message": "تم فتح الوردية بنجاح"
}
```

---

### POST `/api/shifts/close`

إغلاق وردية

**Request:**

```json
{
  "shift_id": 1,
  "closing_cash": 2500.0,
  "notes": "إغلاق نهاية اليوم",
  "cash_counts": [
    { "denomination": 500, "count": 3 },
    { "denomination": 100, "count": 8 },
    { "denomination": 50, "count": 4 },
    { "denomination": 10, "count": 10 },
    { "denomination": 5, "count": 10 },
    { "denomination": 1, "count": 50 }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "shift_number": "SH-2024-001",
    "opening_cash": 500.0,
    "closing_cash": 2500.0,
    "expected_cash": 2450.0,
    "cash_difference": 50.0,
    "total_sales": 3500.0,
    "total_refunds": 150.0,
    "net_sales": 3350.0,
    "payments_summary": {
      "cash": 2000.0,
      "card": 1200.0,
      "fawry": 300.0
    },
    "orders_count": 45,
    "status": "closed",
    "opened_at": "2024-01-15T08:00:00Z",
    "closed_at": "2024-01-15T22:00:00Z"
  }
}
```

---

### GET `/api/shifts/current`

الوردية الحالية مع الطلبات

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "opening_balance": 500.0,
    "closing_balance": null,
    "expected_balance": 2350.0,
    "difference": null,
    "opened_at": "2026-01-07T08:00:00Z",
    "closed_at": null,
    "is_closed": false,
    "notes": null,
    "total_cash": 1850.0,
    "total_card": 650.0,
    "total_orders": 8,
    "user_name": "أحمد محمد",
    "orders": [
      {
        "id": 124,
        "order_number": "ORD-20260107-ABC123",
        "status": "Completed",
        "order_type": "dine_in",
        "total": 65.0,
        "customer_name": "محمد أحمد",
        "created_at": "2026-01-07T10:30:00Z",
        "completed_at": "2026-01-07T10:45:00Z"
      },
      {
        "id": 125,
        "order_number": "ORD-20260107-DEF456",
        "status": "Draft",
        "order_type": "takeaway",
        "total": 45.0,
        "customer_name": null,
        "created_at": "2026-01-07T11:00:00Z",
        "completed_at": null
      }
    ]
  }
}
```

**ملاحظات:**
- `total_orders`, `total_cash`, `total_card` تُحسب ديناميكياً من الطلبات المكتملة للورديات المفتوحة
- عند إغلاق الوردية، تُحفظ هذه القيم في قاعدة البيانات

---

### GET `/api/shifts`

قائمة الورديات

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `branch_id` | integer | الفرع |
| `user_id` | integer | الموظف |
| `status` | string | open, closed |
| `from_date` | date | من تاريخ |
| `to_date` | date | إلى تاريخ |

---

### GET `/api/shifts/{id}`

تفاصيل وردية

---

### POST `/api/shifts/{id}/cash-in`

إيداع نقدي

**Request:**

```json
{
  "amount": 200.0,
  "reason": "إيداع من المدير",
  "notes": ""
}
```

---

### POST `/api/shifts/{id}/cash-out`

سحب نقدي

**Request:**

```json
{
  "amount": 100.0,
  "reason": "مصاريف نثرية",
  "notes": "شراء مستلزمات"
}
```

---

### GET `/api/shifts/{id}/transactions`

معاملات الوردية

---

### GET `/api/registers`

قائمة أجهزة الكاشير

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "كاشير 1",
      "branch_id": 1,
      "status": "active",
      "current_shift": {
        "id": 1,
        "user_name": "أحمد",
        "status": "open"
      }
    }
  ]
}
```

---

## 21. 📈 Reports (التقارير)

### GET `/api/reports/sales`

تقرير المبيعات

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `branch_id` | integer | الفرع |
| `from_date` | date | من تاريخ |
| `to_date` | date | إلى تاريخ |
| `group_by` | string | day, week, month, year |

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_sales": 150000.0,
      "total_orders": 450,
      "average_order": 333.33,
      "total_tax": 22500.0,
      "total_discounts": 5000.0,
      "net_sales": 122500.0,
      "total_refunds": 3000.0
    },
    "by_period": [
      {
        "date": "2024-01-01",
        "sales": 5000.0,
        "orders": 15,
        "average": 333.33
      }
    ],
    "by_payment_method": [
      { "method": "cash", "amount": 80000.0, "percentage": 53.33 },
      { "method": "card", "amount": 50000.0, "percentage": 33.33 },
      { "method": "fawry", "amount": 20000.0, "percentage": 13.34 }
    ],
    "by_order_type": [
      { "type": "dine_in", "amount": 100000.0, "count": 300 },
      { "type": "takeaway", "amount": 35000.0, "count": 100 },
      { "type": "delivery", "amount": 15000.0, "count": 50 }
    ]
  }
}
```

---

### GET `/api/reports/products`

تقرير المنتجات

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `branch_id` | integer | الفرع |
| `from_date` | date | من تاريخ |
| `to_date` | date | إلى تاريخ |
| `category_id` | integer | التصنيف |
| `sort_by` | string | quantity, revenue, profit |

**Response:**

```json
{
  "success": true,
  "data": {
    "top_selling": [
      {
        "product_id": 1,
        "product_name": "برجر كلاسيك",
        "quantity_sold": 500,
        "revenue": 12500.0,
        "cost": 6000.0,
        "profit": 6500.0,
        "profit_margin": 52
      }
    ],
    "by_category": [
      {
        "category_id": 1,
        "category_name": "البرجر",
        "quantity_sold": 1200,
        "revenue": 30000.0
      }
    ],
    "low_performing": [
      {
        "product_id": 15,
        "product_name": "سلطة خضراء",
        "quantity_sold": 10,
        "revenue": 150.0
      }
    ]
  }
}
```

---

### GET `/api/reports/inventory`

تقرير المخزون

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_products": 150,
      "total_value": 50000.0,
      "low_stock_count": 12,
      "out_of_stock_count": 3
    },
    "by_category": [
      {
        "category_name": "البرجر",
        "products_count": 20,
        "total_quantity": 500,
        "total_value": 15000.0
      }
    ],
    "movements": {
      "total_in": 1000,
      "total_out": 800,
      "adjustments": -50
    }
  }
}
```

---

### GET `/api/reports/employees`

تقرير الموظفين

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "user_id": 2,
      "user_name": "أحمد",
      "total_sales": 25000.0,
      "orders_count": 75,
      "average_order": 333.33,
      "refunds_count": 2,
      "refunds_amount": 150.0,
      "working_hours": 160,
      "commission": 1250.0
    }
  ]
}
```

---

### GET `/api/reports/customers`

تقرير العملاء

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_customers": 500,
      "new_customers": 50,
      "returning_customers": 200,
      "average_lifetime_value": 500.0
    },
    "top_customers": [
      {
        "customer_id": 1,
        "customer_name": "محمد أحمد",
        "total_orders": 25,
        "total_spent": 2500.0,
        "last_order_date": "2024-01-15"
      }
    ]
  }
}
```

---

### GET `/api/reports/taxes`

تقرير الضرائب

**Response:**

```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "summary": {
      "total_taxable_sales": 130000.0,
      "total_tax_collected": 19500.0,
      "total_exempt_sales": 5000.0
    },
    "by_tax_rate": [
      {
        "tax_name": "ضريبة القيمة المضافة",
        "rate": 15,
        "taxable_amount": 130000.0,
        "tax_amount": 19500.0
      }
    ]
  }
}
```

---

### GET `/api/reports/daily-summary`

ملخص يومي

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `branch_id` | integer | الفرع |
| `date` | date | التاريخ |

**Response:**

```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "branch": "الفرع الرئيسي",
    "sales": {
      "total": 5000.00,
      "orders_count": 45,
      "average_order": 111.11
    },
    "payments": {
      "cash": 3000.00,
      "card": 1500.00,
      "other": 500.00
    },
    "top_products": [...],
    "hourly_sales": [
      { "hour": "09:00", "sales": 200.00 },
      { "hour": "10:00", "sales": 350.00 }
    ]
  }
}
```

---

### POST `/api/reports/export`

تصدير تقرير

**Request:**

```json
{
  "report_type": "sales",
  "format": "pdf",
  "filters": {
    "branch_id": 1,
    "from_date": "2024-01-01",
    "to_date": "2024-01-31"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "download_url": "https://...",
    "expires_at": "2024-01-16T00:00:00Z"
  }
}
```

---

## 13. 🧾 Taxes (الضرائب)

> **ملاحظة:** راجع قسم [ETA E-Invoicing](#26--eta-e-invoicing-الفوترة-الإلكترونية) للفوترة الإلكترونية

### 💰 ضريبة القيمة المضافة في مصر (Egypt VAT)

- **نسبة الضريبة**: 14%
- **نوع الضريبة**: Tax Inclusive (السعر يشمل الضريبة)
- **العملة**: الجنيه المصري (EGP)

### حساب الضريبة (Tax Inclusive)

```
السعر الإجمالي (شامل الضريبة) = السعر المعروض
السعر الصافي = السعر الإجمالي ÷ (1 + 14/100) = السعر الإجمالي ÷ 1.14
مبلغ الضريبة = السعر الإجمالي - السعر الصافي

مثال:
- السعر المعروض: 100 جنيه (شامل الضريبة)
- السعر الصافي: 100 ÷ 1.14 = 87.72 جنيه
- مبلغ الضريبة: 100 - 87.72 = 12.28 جنيه
```

### GET `/api/taxes`

قائمة الضرائب

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "ضريبة القيمة المضافة",
      "name_en": "VAT",
      "rate": 14.0,
      "type": "percentage",
      "is_inclusive": true,
      "is_default": true,
      "is_active": true,
      "applies_to": "all",
      "product_ids": [],
      "category_ids": [],
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```
```

---

### POST `/api/taxes`

إنشاء ضريبة

**Request:**

```json
{
  "name": "ضريبة خدمة",
  "name_en": "Service Tax",
  "rate": 5.0,
  "type": "percentage",
  "is_inclusive": false,
  "is_default": false,
  "is_active": true,
  "applies_to": "specific_categories",
  "category_ids": [1, 2]
}
```

---

### GET `/api/taxes/{id}`

تفاصيل ضريبة

---

### PUT `/api/taxes/{id}`

تحديث ضريبة

---

### DELETE `/api/taxes/{id}`

حذف ضريبة

---

### POST `/api/taxes/calculate`

حساب الضريبة

**Request:**

```json
{
  "items": [
    { "product_id": 1, "quantity": 2, "price": 25.0 },
    { "product_id": 2, "quantity": 1, "price": 15.0 }
  ],
  "branch_id": 1
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "subtotal": 65.0,
    "taxes": [
      {
        "tax_id": 1,
        "tax_name": "ضريبة القيمة المضافة",
        "rate": 15,
        "amount": 9.75
      }
    ],
    "total_tax": 9.75,
    "total": 74.75
  }
}
```

---

## 14. 🪑 Tables (الطاولات - للمطاعم)

### GET `/api/tables`

قائمة الطاولات

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `branch_id` | integer | الفرع |
| `section_id` | integer | القسم |
| `status` | string | available, occupied, reserved |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "طاولة 1",
      "number": 1,
      "section": {
        "id": 1,
        "name": "الصالة الرئيسية"
      },
      "capacity": 4,
      "status": "occupied",
      "current_order": {
        "id": 123,
        "order_number": "ORD-2024-00123",
        "total": 150.0,
        "items_count": 5,
        "started_at": "2024-01-15T10:30:00Z"
      },
      "position": { "x": 100, "y": 200 },
      "shape": "square",
      "is_active": true
    }
  ]
}
```

---

### POST `/api/tables`

إنشاء طاولة

**Request:**

```json
{
  "name": "طاولة 10",
  "number": 10,
  "branch_id": 1,
  "section_id": 1,
  "capacity": 6,
  "position": { "x": 300, "y": 150 },
  "shape": "rectangle",
  "is_active": true
}
```

---

### GET `/api/tables/{id}`

تفاصيل طاولة

---

### PUT `/api/tables/{id}`

تحديث طاولة

---

### DELETE `/api/tables/{id}`

حذف طاولة

---

### POST `/api/tables/{id}/occupy`

شغل طاولة

**Request:**

```json
{
  "guests_count": 4,
  "customer_id": 1,
  "notes": "عميل VIP"
}
```

---

### POST `/api/tables/{id}/release`

تحرير طاولة

---

### POST `/api/tables/{id}/transfer`

نقل طلب لطاولة أخرى

**Request:**

```json
{
  "to_table_id": 5,
  "reason": "طلب العميل"
}
```

---

### POST `/api/tables/{id}/merge`

دمج طاولات

**Request:**

```json
{
  "table_ids": [2, 3],
  "primary_table_id": 1
}
```

---

### POST `/api/tables/{id}/split`

تقسيم فاتورة الطاولة

**Request:**

```json
{
  "split_type": "equal",
  "parts": 2
}
```

أو

```json
{
  "split_type": "by_items",
  "splits": [
    { "items": [1, 2], "customer_name": "أحمد" },
    { "items": [3, 4], "customer_name": "محمد" }
  ]
}
```

---

### GET `/api/table-sections`

أقسام الطاولات

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "الصالة الرئيسية",
      "branch_id": 1,
      "tables_count": 15,
      "sort_order": 1
    },
    {
      "id": 2,
      "name": "الجلسات الخارجية",
      "branch_id": 1,
      "tables_count": 8,
      "sort_order": 2
    }
  ]
}
```

---

### POST `/api/table-sections`

إنشاء قسم

---

### GET `/api/tables/floor-plan`

خريطة الطاولات

**Response:**

```json
{
  "success": true,
  "data": {
    "branch_id": 1,
    "sections": [
      {
        "id": 1,
        "name": "الصالة الرئيسية",
        "tables": [
          {
            "id": 1,
            "name": "طاولة 1",
            "position": { "x": 100, "y": 200 },
            "shape": "square",
            "capacity": 4,
            "status": "available"
          }
        ]
      }
    ]
  }
}
```

---

## 15. 🍟 Modifiers (الإضافات)

### GET `/api/modifiers`

قائمة مجموعات الإضافات

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "الإضافات",
      "name_en": "Add-ons",
      "selection_type": "multiple",
      "min_selections": 0,
      "max_selections": 5,
      "is_required": false,
      "options": [
        {
          "id": 1,
          "name": "جبنة إضافية",
          "name_en": "Extra Cheese",
          "price": 3.0,
          "is_default": false,
          "is_active": true
        },
        {
          "id": 2,
          "name": "بيض",
          "name_en": "Egg",
          "price": 2.0,
          "is_default": false,
          "is_active": true
        }
      ],
      "product_ids": [1, 2, 3],
      "category_ids": [1],
      "is_active": true
    },
    {
      "id": 2,
      "name": "حجم المشروب",
      "name_en": "Drink Size",
      "selection_type": "single",
      "min_selections": 1,
      "max_selections": 1,
      "is_required": true,
      "options": [
        { "id": 3, "name": "صغير", "price": 0, "is_default": true },
        { "id": 4, "name": "وسط", "price": 2.0, "is_default": false },
        { "id": 5, "name": "كبير", "price": 4.0, "is_default": false }
      ]
    }
  ]
}
```

---

### POST `/api/modifiers`

إنشاء مجموعة إضافات

**Request:**

```json
{
  "name": "الصوصات",
  "name_en": "Sauces",
  "selection_type": "multiple",
  "min_selections": 0,
  "max_selections": 3,
  "is_required": false,
  "options": [
    { "name": "كاتشب", "price": 0 },
    { "name": "مايونيز", "price": 0 },
    { "name": "صوص حار", "price": 1.0 }
  ],
  "category_ids": [1, 2]
}
```

---

### GET `/api/modifiers/{id}`

تفاصيل مجموعة إضافات

---

### PUT `/api/modifiers/{id}`

تحديث مجموعة إضافات

---

### DELETE `/api/modifiers/{id}`

حذف مجموعة إضافات

---

### POST `/api/modifiers/{id}/options`

إضافة خيار جديد

**Request:**

```json
{
  "name": "صوص ثوم",
  "name_en": "Garlic Sauce",
  "price": 1.5,
  "is_default": false
}
```

---

### PUT `/api/modifiers/{id}/options/{optionId}`

تحديث خيار

---

### DELETE `/api/modifiers/{id}/options/{optionId}`

حذف خيار

---

## 16. 🍳 Kitchen Display (شاشة المطبخ)

### GET `/api/kitchen/orders`

طلبات المطبخ

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `branch_id` | integer | الفرع |
| `station_id` | integer | محطة التحضير |
| `status` | string | pending, preparing, ready |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "order_number": "ORD-2024-00123",
      "order_type": "dine_in",
      "table": {
        "id": 5,
        "name": "طاولة 5"
      },
      "status": "preparing",
      "priority": "normal",
      "items": [
        {
          "id": 1,
          "product_name": "برجر كلاسيك",
          "quantity": 2,
          "modifiers": ["جبنة إضافية", "بدون بصل"],
          "notes": "مستعجل",
          "status": "preparing",
          "station": "الشواية"
        }
      ],
      "created_at": "2024-01-15T10:30:00Z",
      "elapsed_time": "5 دقائق",
      "estimated_time": "10 دقائق"
    }
  ]
}
```

---

### PUT `/api/kitchen/orders/{id}/status`

تحديث حالة الطلب

**Request:**

```json
{
  "status": "ready"
}
```

---

### PUT `/api/kitchen/orders/{id}/items/{itemId}/status`

تحديث حالة صنف

**Request:**

```json
{
  "status": "ready"
}
```

---

### POST `/api/kitchen/orders/{id}/bump`

إنهاء طلب (Bump)

---

### POST `/api/kitchen/orders/{id}/recall`

استرجاع طلب

---

### GET `/api/kitchen/stations`

محطات التحضير

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "الشواية",
      "branch_id": 1,
      "category_ids": [1, 2],
      "pending_orders": 5,
      "is_active": true
    },
    {
      "id": 2,
      "name": "المشروبات",
      "branch_id": 1,
      "category_ids": [5],
      "pending_orders": 3,
      "is_active": true
    }
  ]
}
```

---

### POST `/api/kitchen/stations`

إنشاء محطة تحضير

---

### GET `/api/kitchen/stats`

إحصائيات المطبخ

**Response:**

```json
{
  "success": true,
  "data": {
    "pending_orders": 8,
    "preparing_orders": 5,
    "ready_orders": 3,
    "average_prep_time": "8 دقائق",
    "orders_per_hour": 15,
    "by_station": [
      {
        "station": "الشواية",
        "pending": 4,
        "average_time": "10 دقائق"
      }
    ]
  }
}
```

---

## 17. 📅 Reservations (الحجوزات)

### GET `/api/reservations`

قائمة الحجوزات

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `branch_id` | integer | الفرع |
| `date` | date | التاريخ |
| `status` | string | pending, confirmed, cancelled, completed, no_show |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reservation_number": "RES-2024-001",
      "customer": {
        "id": 1,
        "name": "محمد أحمد",
        "phone": "+966501234567"
      },
      "branch_id": 1,
      "table": {
        "id": 5,
        "name": "طاولة 5"
      },
      "date": "2024-01-20",
      "time": "19:00",
      "duration_minutes": 90,
      "guests_count": 4,
      "status": "confirmed",
      "notes": "عيد ميلاد",
      "special_requests": "كعكة مفاجأة",
      "reminder_sent": true,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### POST `/api/reservations`

إنشاء حجز

**Request:**

```json
{
  "branch_id": 1,
  "customer_id": 1,
  "customer_phone": "+966501234567",
  "customer_name": "محمد أحمد",
  "table_id": 5,
  "date": "2024-01-20",
  "time": "19:00",
  "duration_minutes": 90,
  "guests_count": 4,
  "notes": "عيد ميلاد",
  "special_requests": "كعكة مفاجأة",
  "send_confirmation": true
}
```

---

### GET `/api/reservations/{id}`

تفاصيل حجز

---

### PUT `/api/reservations/{id}`

تحديث حجز

---

### POST `/api/reservations/{id}/confirm`

تأكيد حجز

---

### POST `/api/reservations/{id}/cancel`

إلغاء حجز

**Request:**

```json
{
  "reason": "طلب العميل",
  "notify_customer": true
}
```

---

### POST `/api/reservations/{id}/check-in`

تسجيل وصول

**Response:**

```json
{
  "success": true,
  "data": {
    "reservation_id": 1,
    "status": "completed",
    "checked_in_at": "2024-01-20T19:05:00Z",
    "table": {
      "id": 5,
      "status": "occupied"
    }
  }
}
```

---

### POST `/api/reservations/{id}/no-show`

تسجيل عدم حضور

---

### GET `/api/reservations/availability`

التحقق من التوفر

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `branch_id` | integer | الفرع |
| `date` | date | التاريخ |
| `time` | time | الوقت |
| `guests_count` | integer | عدد الضيوف |
| `duration_minutes` | integer | المدة |

**Response:**

```json
{
  "success": true,
  "data": {
    "available": true,
    "available_tables": [
      {
        "id": 5,
        "name": "طاولة 5",
        "capacity": 4,
        "section": "الصالة الرئيسية"
      },
      {
        "id": 8,
        "name": "طاولة 8",
        "capacity": 6,
        "section": "الجلسات الخارجية"
      }
    ],
    "alternative_times": ["18:00", "20:30"]
  }
}
```

---

### GET `/api/reservations/waitlist`

قائمة الانتظار

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer_name": "سعد علي",
      "phone": "+966509876543",
      "guests_count": 2,
      "estimated_wait": "15 دقيقة",
      "added_at": "2024-01-15T19:00:00Z",
      "position": 1
    }
  ]
}
```

---

### POST `/api/reservations/waitlist`

إضافة لقائمة الانتظار

**Request:**

```json
{
  "branch_id": 1,
  "customer_name": "سعد علي",
  "phone": "+966509876543",
  "guests_count": 2,
  "notes": ""
}
```

---

## 18. 🏭 Suppliers (الموردين)

### GET `/api/suppliers`

قائمة الموردين

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | active, inactive |
| `search` | string | البحث بالاسم |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "شركة التوريدات الغذائية",
      "code": "SUP001",
      "contact_person": "أحمد محمد",
      "email": "supplier@example.com",
      "phone": "+966501234567",
      "address": "الرياض، حي الصناعية",
      "tax_number": "300000000000005",
      "payment_terms": "net_30",
      "credit_limit": 50000.00,
      "current_balance": 15000.00,
      "bank_details": {
        "bank_name": "البنك الأهلي",
        "account_number": "1234567890",
        "iban": "SA..."
      },
      "categories": ["مواد غذائية", "خضار"],
      "rating": 4.5,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### POST `/api/suppliers`

إنشاء مورد

**Request:**

```json
{
  "name": "شركة المشروبات المتحدة",
  "code": "SUP002",
  "contact_person": "خالد سعد",
  "email": "drinks@example.com",
  "phone": "+966509876543",
  "address": "جدة، حي البوادي",
  "tax_number": "300000000000006",
  "payment_terms": "net_15",
  "credit_limit": 30000.0,
  "categories": ["مشروبات"]
}
```

---

### GET `/api/suppliers/{id}`

تفاصيل مورد

---

### PUT `/api/suppliers/{id}`

تحديث مورد

---

### DELETE `/api/suppliers/{id}`

حذف مورد

---

### GET `/api/suppliers/{id}/transactions`

معاملات المورد

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "purchase",
      "reference": "PO-2024-001",
      "amount": 5000.0,
      "balance_after": 20000.0,
      "date": "2024-01-15",
      "notes": ""
    },
    {
      "id": 2,
      "type": "payment",
      "reference": "PAY-2024-001",
      "amount": -3000.0,
      "balance_after": 17000.0,
      "date": "2024-01-20",
      "payment_method": "bank_transfer"
    }
  ]
}
```

---

### POST `/api/suppliers/{id}/payments`

تسجيل دفعة للمورد

**Request:**

```json
{
  "amount": 5000.0,
  "payment_method": "bank_transfer",
  "reference": "TRF-123456",
  "date": "2024-01-20",
  "notes": "دفعة شهر يناير"
}
```

---

## 19. 📋 Purchase Orders (أوامر الشراء)

### GET `/api/purchase-orders`

قائمة أوامر الشراء

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `branch_id` | integer | الفرع |
| `supplier_id` | integer | المورد |
| `status` | string | draft, sent, partial, received, cancelled |
| `from_date` | date | من تاريخ |
| `to_date` | date | إلى تاريخ |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "po_number": "PO-2024-001",
      "supplier": {
        "id": 1,
        "name": "شركة التوريدات الغذائية"
      },
      "branch_id": 1,
      "status": "sent",
      "items": [
        {
          "id": 1,
          "product_id": 10,
          "product_name": "لحم برجر",
          "sku": "RAW001",
          "quantity_ordered": 50,
          "quantity_received": 0,
          "unit": "kg",
          "unit_cost": 45.00,
          "total": 2250.00
        }
      ],
      "subtotal": 5000.00,
      "tax_amount": 750.00,
      "total": 5750.00,
      "expected_date": "2024-01-20",
      "notes": "توريد أسبوعي",
      "created_by": {
        "id": 1,
        "name": "أحمد"
      },
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### POST `/api/purchase-orders`

إنشاء أمر شراء

**Request:**

```json
{
  "supplier_id": 1,
  "branch_id": 1,
  "items": [
    {
      "product_id": 10,
      "quantity": 50,
      "unit_cost": 45.0
    },
    {
      "product_id": 11,
      "quantity": 30,
      "unit_cost": 25.0
    }
  ],
  "expected_date": "2024-01-20",
  "notes": "توريد أسبوعي",
  "send_to_supplier": true
}
```

---

### GET `/api/purchase-orders/{id}`

تفاصيل أمر شراء

---

### PUT `/api/purchase-orders/{id}`

تحديث أمر شراء (draft فقط)

---

### POST `/api/purchase-orders/{id}/send`

إرسال للمورد

---

### POST `/api/purchase-orders/{id}/receive`

استلام البضائع

**Request:**

```json
{
  "items": [
    {
      "item_id": 1,
      "quantity_received": 48,
      "notes": "2 كيلو ناقص"
    },
    {
      "item_id": 2,
      "quantity_received": 30
    }
  ],
  "received_by": "سعد",
  "notes": "استلام جزئي"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "partial",
    "items_summary": {
      "total_items": 2,
      "fully_received": 1,
      "partially_received": 1
    },
    "inventory_updated": true,
    "grn_number": "GRN-2024-001"
  }
}
```

---

### POST `/api/purchase-orders/{id}/cancel`

إلغاء أمر شراء

---

### GET `/api/purchase-orders/{id}/history`

تاريخ أمر الشراء

---

## 20. 🍳 Recipes/BOM (الوصفات/قائمة المواد)

### GET `/api/recipes`

قائمة الوصفات

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "برجر كلاسيك",
      "yield_quantity": 1,
      "yield_unit": "piece",
      "ingredients": [
        {
          "id": 1,
          "raw_material_id": 10,
          "name": "لحم برجر",
          "quantity": 0.15,
          "unit": "kg",
          "cost": 6.75,
          "is_critical": true
        },
        {
          "id": 2,
          "raw_material_id": 11,
          "name": "خبز برجر",
          "quantity": 1,
          "unit": "piece",
          "cost": 0.5,
          "is_critical": true
        },
        {
          "id": 3,
          "raw_material_id": 12,
          "name": "خس",
          "quantity": 0.02,
          "unit": "kg",
          "cost": 0.3,
          "is_critical": false
        }
      ],
      "total_cost": 10.55,
      "selling_price": 25.0,
      "profit_margin": 57.8,
      "instructions": "1. شوي اللحم\n2. تحميص الخبز\n3. التجميع",
      "prep_time_minutes": 10,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/api/recipes`

إنشاء وصفة

**Request:**

```json
{
  "product_id": 2,
  "yield_quantity": 1,
  "yield_unit": "piece",
  "ingredients": [
    {
      "raw_material_id": 15,
      "quantity": 0.2,
      "unit": "kg",
      "is_critical": true
    },
    {
      "raw_material_id": 11,
      "quantity": 1,
      "unit": "piece",
      "is_critical": true
    }
  ],
  "instructions": "خطوات التحضير...",
  "prep_time_minutes": 8
}
```

---

### GET `/api/recipes/{id}`

تفاصيل وصفة

---

### PUT `/api/recipes/{id}`

تحديث وصفة

---

### DELETE `/api/recipes/{id}`

حذف وصفة

---

### GET `/api/recipes/{id}/cost-analysis`

تحليل تكلفة الوصفة

**Response:**

```json
{
  "success": true,
  "data": {
    "product_id": 1,
    "product_name": "برجر كلاسيك",
    "current_cost": 10.55,
    "historical_costs": [
      { "date": "2024-01-01", "cost": 9.8 },
      { "date": "2024-01-15", "cost": 10.55 }
    ],
    "cost_breakdown": [
      { "ingredient": "لحم برجر", "percentage": 64.0, "cost": 6.75 },
      { "ingredient": "خبز برجر", "percentage": 4.7, "cost": 0.5 },
      { "ingredient": "أخرى", "percentage": 31.3, "cost": 3.3 }
    ],
    "selling_price": 25.0,
    "food_cost_percentage": 42.2,
    "recommended_price": 26.38,
    "profit": 14.45
  }
}
```

---

### POST `/api/recipes/calculate-deduction`

حساب خصم المواد الخام (عند البيع)

**Request:**

```json
{
  "order_items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ],
  "branch_id": 1
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "deductions": [
      {
        "raw_material_id": 10,
        "name": "لحم برجر",
        "quantity_to_deduct": 0.5,
        "unit": "kg",
        "current_stock": 25.5,
        "after_deduction": 25.0,
        "sufficient": true
      },
      {
        "raw_material_id": 11,
        "name": "خبز برجر",
        "quantity_to_deduct": 3,
        "unit": "piece",
        "current_stock": 50,
        "after_deduction": 47,
        "sufficient": true
      }
    ],
    "all_sufficient": true,
    "warnings": []
  }
}
```

---

### GET `/api/raw-materials`

قائمة المواد الخام

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "name": "لحم برجر",
      "sku": "RAW001",
      "category": "لحوم",
      "unit": "kg",
      "cost": 45.0,
      "stock_quantity": 25.5,
      "low_stock_threshold": 10,
      "supplier_id": 1,
      "is_active": true
    }
  ]
}
```

---

## 22. 🔍 Audit Logs (سجل التدقيق)

### 📝 الحقول المسجلة

كل عملية تدقيق تسجل المعلومات التالية:

| الحقل | الوصف |
|-------|-------|
| `user_id` | معرف المستخدم (من JWT claims) |
| `user_name` | اسم المستخدم (من JWT claims) |
| `ip_address` | عنوان IP للعميل (من X-Forwarded-For أو X-Real-IP أو RemoteIpAddress) |
| `entity_type` | نوع الكيان (Order, Product, Shift, etc.) |
| `entity_id` | معرف الكيان (يُحفظ بعد الإنشاء للكيانات الجديدة) |
| `action` | نوع العملية (Create, Update, Delete) |
| `old_values` | القيم القديمة (JSON) |
| `new_values` | القيم الجديدة (JSON) |

### GET `/api/audit-logs`

سجل التدقيق

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | integer | فلترة حسب المستخدم |
| `action` | string | Create, Update, Delete |
| `entity_type` | string | Order, Payment, Shift, Product, etc. |
| `entity_id` | integer | معرف الكيان |
| `from_date` | datetime | من تاريخ (YYYY-MM-DD) |
| `to_date` | datetime | إلى تاريخ (YYYY-MM-DD) |
| `branch_id` | integer | الفرع |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tenant_id": 1,
      "branch_id": 1,
      "user_id": 2,
      "user_name": "أحمد محمد",
      "action": "Update",
      "entity_type": "Order",
      "entity_id": 123,
      "old_values": "{\"Status\":\"Draft\",\"Total\":150.00}",
      "new_values": "{\"Status\":\"Completed\",\"Total\":150.00,\"CompletedAt\":\"2026-01-07T10:45:00Z\"}",
      "ip_address": "192.168.1.100",
      "created_at": "2026-01-07T10:45:00Z"
    },
    {
      "id": 2,
      "tenant_id": 1,
      "branch_id": 1,
      "user_id": 2,
      "user_name": "أحمد محمد",
      "action": "Create",
      "entity_type": "Payment",
      "entity_id": 45,
      "old_values": null,
      "new_values": "{\"OrderId\":123,\"Amount\":150.00,\"Method\":\"Cash\"}",
      "ip_address": "192.168.1.100",
      "created_at": "2026-01-07T10:45:00Z"
    }
  ],
  "meta": { ... }
}
```

### 🏷️ وصف العمليات بالعربية

للعرض في الواجهة، يمكن تحويل العمليات التقنية إلى وصف عربي مفهوم:

| Entity | Action | Condition | الوصف بالعربية |
|--------|--------|-----------|----------------|
| Order | Create | - | إنشاء طلب جديد |
| Order | Update | Status → Completed | تم إتمام الدفع وإغلاق الطلب |
| Order | Update | Status → Cancelled | إلغاء الطلب |
| Order | Update | Other | تعديل بيانات الطلب |
| Payment | Create | - | تسجيل دفعة |
| Shift | Create | - | فتح وردية |
| Shift | Update | IsClosed → true | إغلاق الوردية |
| Product | Create | - | إضافة منتج جديد |
| Product | Update | - | تعديل بيانات المنتج |

### 🏷️ حالات الطلب (Status Badges)

| Status | Badge | اللون |
|--------|-------|-------|
| Completed | مكتمل | أخضر |
| Cancelled | ملغي | أحمر |
| Draft | مسودة | رمادي |
```

---

### GET `/api/audit-logs/{id}`

تفاصيل سجل

---

### GET `/api/audit-logs/actions`

قائمة الإجراءات المتاحة

**Response:**

```json
{
  "success": true,
  "data": {
    "order": ["create", "update", "complete", "cancel", "void", "refund"],
    "payment": ["create", "refund"],
    "inventory": ["adjust", "transfer", "count"],
    "shift": ["open", "close", "cash_in", "cash_out"],
    "user": [
      "create",
      "update",
      "delete",
      "login",
      "logout",
      "permission_change"
    ],
    "product": ["create", "update", "delete", "price_change"],
    "settings": ["update"]
  }
}
```

---

### POST `/api/audit-logs/export`

تصدير سجل التدقيق

**Request:**

```json
{
  "from_date": "2024-01-01",
  "to_date": "2024-01-31",
  "format": "pdf",
  "filters": {
    "actions": ["order.refund", "order.void"],
    "user_id": null
  }
}
```

---

## 23. 🔔 Notifications (الإشعارات)

### GET `/api/notifications`

قائمة الإشعارات

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | order, inventory, system |
| `is_read` | boolean | مقروءة/غير مقروءة |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "inventory",
      "title": "تنبيه مخزون منخفض",
      "message": "المنتج 'برجر كلاسيك' وصل للحد الأدنى",
      "data": {
        "product_id": 1,
        "current_quantity": 8,
        "threshold": 10
      },
      "is_read": false,
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "type": "order",
      "title": "طلب جديد",
      "message": "طلب جديد #123 من طاولة 5",
      "data": {
        "order_id": 123,
        "table_id": 5
      },
      "is_read": true,
      "created_at": "2024-01-15T10:25:00Z"
    }
  ],
  "meta": {
    "unread_count": 5
  }
}
```

---

### PUT `/api/notifications/{id}/read`

تحديد كمقروء

---

### PUT `/api/notifications/read-all`

تحديد الكل كمقروء

---

### DELETE `/api/notifications/{id}`

حذف إشعار

---

### GET `/api/notifications/settings`

إعدادات الإشعارات

**Response:**

```json
{
  "success": true,
  "data": {
    "push_enabled": true,
    "email_enabled": true,
    "sound_enabled": true,
    "types": {
      "new_order": { "push": true, "email": false, "sound": true },
      "low_stock": { "push": true, "email": true, "sound": false },
      "shift_end": { "push": true, "email": false, "sound": true }
    }
  }
}
```

---

### PUT `/api/notifications/settings`

تحديث إعدادات الإشعارات

---

### WebSocket `/ws/notifications`

الإشعارات الفورية

**Events:**

```javascript
// الاتصال
socket.connect("wss://api.kasserpro.com/ws/notifications", {
  token: "access_token",
});

// استقبال إشعار
socket.on("notification", (data) => {
  // { type: 'new_order', data: {...} }
});

// استقبال تحديث طلب
socket.on("order_update", (data) => {
  // { order_id: 123, status: 'ready' }
});

// استقبال تحديث طاولة
socket.on("table_update", (data) => {
  // { table_id: 5, status: 'occupied' }
});
```

---

## 24. ⚙️ Settings (الإعدادات)

### GET `/api/settings`

الإعدادات العامة

**Response:**

```json
{
  "success": true,
  "data": {
    "company": {
      "name": "كاشير برو",
      "name_en": "KasserPro",
      "logo_url": "https://...",
      "tax_number": "123456789",
      "address": "القاهرة، جمهورية مصر العربية",
      "phone": "+20223456789",
      "email": "info@kasserpro.com",
      "website": "https://kasserpro.com"
    },
    "currency": {
      "code": "EGP",
      "symbol": "ج.م",
      "position": "after",
      "decimal_places": 2
    },
    "locale": {
      "language": "ar",
      "timezone": "Africa/Cairo",
      "date_format": "DD/MM/YYYY",
      "time_format": "HH:mm"
    },
    "tax": {
      "default_rate": 14.0,
      "is_inclusive": true,
      "name": "ضريبة القيمة المضافة"
    },
    "pos": {
      "default_order_type": "dine_in",
      "require_customer": false,
      "allow_negative_stock": false,
      "auto_print_receipt": true,
      "receipt_copies": 1,
      "show_product_images": true,
      "quick_cash_amounts": [10, 20, 50, 100, 200, 500]
    },
    "inventory": {
      "track_stock": true,
      "low_stock_alert": true,
      "negative_stock_allowed": false
    },
    "receipt": {
      "header": "مرحباً بكم في كاشير برو",
      "footer": "شكراً لزيارتكم",
      "show_logo": true,
      "show_tax_details": true,
      "show_cashier_name": true,
      "paper_size": "80mm"
    }
  }
}
```

---

### PUT `/api/settings`

تحديث الإعدادات

**Request:**

```json
{
  "pos": {
    "auto_print_receipt": false,
    "show_product_images": true
  }
}
```

---

### GET `/api/settings/receipt`

إعدادات الفاتورة

---

### PUT `/api/settings/receipt`

تحديث إعدادات الفاتورة

---

### GET `/api/settings/pos`

إعدادات نقطة البيع

---

### PUT `/api/settings/pos`

تحديث إعدادات نقطة البيع

---

### POST `/api/settings/logo`

رفع الشعار

**Request:** `multipart/form-data`

```
logo: [file]
```

---

### GET `/api/settings/backup`

إنشاء نسخة احتياطية

---

### POST `/api/settings/restore`

استعادة نسخة احتياطية

---

## 25. 🔄 Sync (المزامنة - للـ Offline)

### GET `/api/sync/status`

حالة المزامنة

**Response:**

```json
{
  "success": true,
  "data": {
    "last_sync": "2024-01-15T10:30:00Z",
    "pending_changes": 5,
    "sync_status": "synced",
    "server_time": "2024-01-15T10:35:00Z"
  }
}
```

---

### POST `/api/sync/pull`

سحب البيانات من السيرفر

**Request:**

```json
{
  "last_sync": "2024-01-15T10:00:00Z",
  "entities": ["products", "categories", "customers", "settings"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "products": {
      "created": [...],
      "updated": [...],
      "deleted": [1, 5, 10]
    },
    "categories": {
      "created": [...],
      "updated": [...],
      "deleted": []
    },
    "sync_token": "abc123",
    "server_time": "2024-01-15T10:35:00Z"
  }
}
```

---

### POST `/api/sync/push`

دفع البيانات للسيرفر

**Request:**

```json
{
  "device_id": "device-uuid",
  "changes": {
    "orders": [
      {
        "local_id": "local-123",
        "action": "create",
        "data": { ... },
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "customers": [
      {
        "local_id": "local-456",
        "action": "create",
        "data": { ... }
      }
    ]
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "synced": [
      { "local_id": "local-123", "server_id": 456, "entity": "orders" }
    ],
    "conflicts": [],
    "errors": []
  }
}
```

---

### GET `/api/sync/download`

تحميل البيانات الكاملة (للتثبيت الأول)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `branch_id` | integer | الفرع |

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [...],
    "categories": [...],
    "modifiers": [...],
    "taxes": [...],
    "payment_methods": [...],
    "tables": [...],
    "customers": [...],
    "settings": {...},
    "sync_token": "initial-sync-token",
    "generated_at": "2024-01-15T10:35:00Z"
  }
}
```

---

### POST `/api/sync/resolve-conflict`

حل تعارض

**Request:**

```json
{
  "conflict_id": 1,
  "resolution": "server",
  "entity": "customer",
  "entity_id": 123
}
```

---

## 26. 🧾 ETA E-Invoicing (الفوترة الإلكترونية المصرية)

> **ملاحظة مهمة:** هذا القسم خاص بمتطلبات مصلحة الضرائب المصرية للفوترة الإلكترونية (منظومة الفاتورة الإلكترونية).
>
> **ملاحظة للمطورين:** الـ APIs التالية مصممة للتكامل مع منظومة الفاتورة الإلكترونية المصرية (ETA). يمكن تعديل الأسماء والمسارات حسب المتطلبات الفعلية.

### GET `/api/eta/status`

حالة الربط مع منظومة الفاتورة الإلكترونية

**Response:**

```json
{
  "success": true,
  "data": {
    "integration_status": "active",
    "compliance_phase": "phase_2",
    "onboarding_status": "completed",
    "last_clearance": "2024-01-15T10:30:00Z",
    "certificates": {
      "compliance_certificate": {
        "status": "valid",
        "expires_at": "2025-01-15"
      },
      "production_certificate": {
        "status": "valid",
        "expires_at": "2025-01-15"
      }
    },
    "statistics": {
      "invoices_today": 45,
      "cleared_today": 45,
      "failed_today": 0
    }
  }
}
```

---

### POST `/api/eta/onboarding`

تسجيل النظام (Onboarding)

**Request:**

```json
{
  "client_id": "123456",
  "client_secret": "...",
  "branch_id": 1,
  "device_serial": "POS-001",
  "registration_data": {
    "common_name": "KasserPro POS",
    "organization_unit": "فرع القاهرة",
    "organization_name": "شركة كاشير برو",
    "country": "EG",
    "tax_id": "123456789",
    "location": "القاهرة",
    "industry": "مطاعم"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "request_id": "req_abc123",
    "compliance_csid": "...",
    "compliance_certificate": "...",
    "status": "pending_production"
  }
}
```

---

### POST `/api/eta/invoices/report`

إرسال فاتورة للزاتكا (Reporting - B2C)

**Request:**

```json
{
  "order_id": 123,
  "invoice_type": "simplified",
  "invoice_subtype": "0100000"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "invoice_id": 123,
    "eta_status": "reported",
    "reporting_status": "SUCCESS",
    "invoice_hash": "...",
    "qr_code": "base64...",
    "warnings": [],
    "reported_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### POST `/api/eta/invoices/clear`

اعتماد فاتورة ضريبية (Clearance - B2B)

**Request:**

```json
{
  "order_id": 124,
  "invoice_type": "standard",
  "invoice_subtype": "0100000",
  "customer_tax_id": "123456789"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "invoice_id": 124,
    "eta_status": "cleared",
    "clearance_status": "CLEARED",
    "cleared_invoice": "base64...",
    "invoice_hash": "...",
    "qr_code": "base64...",
    "eta_uuid": "...",
    "cleared_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### GET `/api/eta/invoices/{id}`

حالة فاتورة في منظومة الفاتورة الإلكترونية

**Response:**

```json
{
  "success": true,
  "data": {
    "order_id": 123,
    "invoice_number": "INV-2024-00123",
    "invoice_type": "simplified",
    "eta_status": "reported",
    "eta_uuid": "...",
    "invoice_hash": "...",
    "qr_code": "base64...",
    "xml_invoice": "base64...",
    "reporting_response": {
      "status": "SUCCESS",
      "warnings": []
    },
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### POST `/api/eta/invoices/credit-note`

إشعار دائن (Credit Note)

**Request:**

```json
{
  "original_invoice_id": 123,
  "refund_id": 5,
  "reason": "منتج معيب",
  "reason_code": "RETURN"
}
```

---

### POST `/api/eta/invoices/debit-note`

إشعار مدين (Debit Note)

**Request:**

```json
{
  "original_invoice_id": 123,
  "amount": 50.0,
  "reason": "تعديل السعر",
  "reason_code": "PRICE_ADJUSTMENT"
}
```

---

### GET `/api/eta/invoices`

قائمة الفواتير المرسلة للزاتكا

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | pending, reported, cleared, failed |
| `type` | string | simplified, standard |
| `from_date` | date | من تاريخ |
| `to_date` | date | إلى تاريخ |

---

### POST `/api/eta/invoices/retry`

إعادة إرسال فاتورة فاشلة

**Request:**

```json
{
  "invoice_ids": [123, 124, 125]
}
```

---

### GET `/api/eta/settings`

إعدادات زاتكا

**Response:**

```json
{
  "success": true,
  "data": {
    "auto_report": true,
    "auto_clear": true,
    "retry_failed": true,
    "retry_interval_minutes": 15,
    "invoice_counter": 1250,
    "pih": "...",
    "seller_info": {
      "name": "شركة كاشير برو",
      "vat_number": "300000000000003",
      "address": {
        "street": "شارع الملك فهد",
        "building": "123",
        "city": "الرياض",
        "district": "العليا",
        "postal_code": "12345",
        "country": "SA"
      }
    }
  }
}
```

---

### PUT `/api/eta/settings`

تحديث إعدادات زاتكا

---

## 27. 🔗 Webhooks

### GET `/api/webhooks`

قائمة الـ Webhooks

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "url": "https://example.com/webhook",
      "events": ["order.created", "order.completed", "payment.received"],
      "secret": "whsec_...",
      "is_active": true,
      "last_triggered_at": "2024-01-15T10:30:00Z",
      "failure_count": 0,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/api/webhooks`

إنشاء Webhook

**Request:**

```json
{
  "url": "https://example.com/webhook",
  "events": [
    "order.created",
    "order.completed",
    "order.refunded",
    "payment.received",
    "inventory.low_stock",
    "shift.opened",
    "shift.closed"
  ],
  "secret": "my_secret_key"
}
```

---

### GET `/api/webhooks/{id}`

تفاصيل Webhook

---

### PUT `/api/webhooks/{id}`

تحديث Webhook

---

### DELETE `/api/webhooks/{id}`

حذف Webhook

---

### POST `/api/webhooks/{id}/test`

اختبار Webhook

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "success",
    "response_code": 200,
    "response_time_ms": 150
  }
}
```

---

### GET `/api/webhooks/{id}/logs`

سجل Webhook

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "event": "order.created",
      "payload": { ... },
      "response_code": 200,
      "response_body": "OK",
      "response_time_ms": 120,
      "status": "success",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Webhook Events Reference

| Event                    | Description  | Payload                |
| ------------------------ | ------------ | ---------------------- |
| `order.created`          | طلب جديد     | Order object           |
| `order.completed`        | طلب مكتمل    | Order object           |
| `order.cancelled`        | طلب ملغي     | Order + reason         |
| `order.refunded`         | طلب مسترجع   | Order + refund details |
| `payment.received`       | دفعة مستلمة  | Payment object         |
| `payment.refunded`       | دفعة مستردة  | Payment + refund       |
| `inventory.low_stock`    | مخزون منخفض  | Product + quantity     |
| `inventory.out_of_stock` | نفاذ المخزون | Product                |
| `shift.opened`           | وردية مفتوحة | Shift object           |
| `shift.closed`           | وردية مغلقة  | Shift + summary        |
| `customer.created`       | عميل جديد    | Customer object        |
| `reservation.created`    | حجز جديد     | Reservation object     |
| `reservation.cancelled`  | حجز ملغي     | Reservation + reason   |

### Webhook Payload Format

```json
{
  "id": "evt_abc123",
  "event": "order.created",
  "created_at": "2024-01-15T10:30:00Z",
  "data": {
    "object": { ... }
  },
  "tenant_id": 1,
  "branch_id": 1
}
```

### Webhook Signature Verification

```http
X-Webhook-Signature: sha256=...
X-Webhook-Timestamp: 1705312200
```

```javascript
const expectedSignature = crypto
  .createHmac("sha256", secret)
  .update(`${timestamp}.${JSON.stringify(payload)}`)
  .digest("hex");
```

---

## 28. 🔗 ERP Integration (للربط مع ERP)

### GET `/api/erp/config`

إعدادات الربط

**Response:**

```json
{
  "success": true,
  "data": {
    "erp_type": "odoo",
    "base_url": "https://erp.company.com",
    "is_connected": true,
    "last_sync": "2024-01-15T10:00:00Z",
    "sync_settings": {
      "auto_sync": true,
      "sync_interval": 15,
      "sync_products": true,
      "sync_orders": true,
      "sync_customers": true,
      "sync_inventory": true
    }
  }
}
```

---

### PUT `/api/erp/config`

تحديث إعدادات الربط

**Request:**

```json
{
  "erp_type": "odoo",
  "base_url": "https://erp.company.com",
  "api_key": "erp-api-key",
  "database": "company_db",
  "sync_settings": {
    "auto_sync": true,
    "sync_interval": 15
  }
}
```

---

### POST `/api/erp/test-connection`

اختبار الاتصال

**Response:**

```json
{
  "success": true,
  "data": {
    "connected": true,
    "erp_version": "16.0",
    "company_name": "شركة ABC"
  }
}
```

---

### POST `/api/erp/sync`

مزامنة يدوية

**Request:**

```json
{
  "entities": ["products", "customers", "orders"],
  "direction": "both",
  "from_date": "2024-01-01"
}
```

---

### GET `/api/erp/sync-log`

سجل المزامنة

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "products",
      "direction": "pull",
      "status": "success",
      "records_synced": 150,
      "errors": 0,
      "started_at": "2024-01-15T10:00:00Z",
      "completed_at": "2024-01-15T10:02:00Z"
    }
  ]
}
```

---

### POST `/api/erp/export/orders`

تصدير الطلبات للـ ERP

**Request:**

```json
{
  "from_date": "2024-01-01",
  "to_date": "2024-01-31",
  "branch_id": 1
}
```

---

### POST `/api/erp/import/products`

استيراد المنتجات من الـ ERP

---

### GET `/api/erp/mappings`

خرائط الربط

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [{ "pos_id": 1, "erp_id": "PROD001", "name": "برجر كلاسيك" }],
    "categories": [{ "pos_id": 1, "erp_id": "CAT001", "name": "البرجر" }],
    "payment_methods": [
      { "pos_code": "cash", "erp_journal_id": 1 },
      { "pos_code": "card", "erp_journal_id": 2 }
    ]
  }
}
```

---

### PUT `/api/erp/mappings`

تحديث خرائط الربط

---

### Webhooks للـ ERP

**POST `/api/webhooks/erp/product-updated`**

```json
{
  "event": "product.updated",
  "erp_id": "PROD001",
  "data": {
    "name": "برجر كلاسيك محدث",
    "price": 27.0
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**POST `/api/webhooks/erp/inventory-updated`**

```json
{
  "event": "inventory.updated",
  "erp_id": "PROD001",
  "data": {
    "quantity": 100,
    "warehouse_id": "WH001"
  }
}
```

---

## 📝 ملاحظات إضافية

### Rate Limiting

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705312800
```

### HTTP Status Codes

| Code | Description       |
| ---- | ----------------- |
| 200  | Success           |
| 201  | Created           |
| 400  | Bad Request       |
| 401  | Unauthorized      |
| 403  | Forbidden         |
| 404  | Not Found         |
| 422  | Validation Error  |
| 429  | Too Many Requests |
| 500  | Server Error      |

### Error Codes

| Code                      | Description             |
| ------------------------- | ----------------------- |
| `VALIDATION_ERROR`        | خطأ في البيانات المدخلة |
| `AUTHENTICATION_ERROR`    | خطأ في المصادقة         |
| `AUTHORIZATION_ERROR`     | غير مصرح                |
| `NOT_FOUND`               | غير موجود               |
| `INSUFFICIENT_STOCK`      | مخزون غير كافي          |
| `SHIFT_NOT_OPEN`          | الوردية غير مفتوحة      |
| `ORDER_ALREADY_COMPLETED` | الطلب مكتمل بالفعل      |
| `INVALID_DISCOUNT_CODE`   | كود خصم غير صالح        |

---

## 🚀 التنفيذ المقترح

### المرحلة الأولى (الأساسيات - MVP) ⏱️ 6-8 أسابيع

| #   | Feature                        | Priority    | Notes                   |
| --- | ------------------------------ | ----------- | ----------------------- |
| 1   | Authentication & Authorization | 🔴 Critical | JWT, Roles, Permissions |
| 2   | Tenants (Multi-tenant)         | 🔴 Critical | SaaS foundation         |
| 3   | Branches                       | 🔴 Critical | Multi-branch support    |
| 4   | Products & Categories          | 🔴 Critical | Core catalog            |
| 5   | Orders (CRUD)                  | 🔴 Critical | Main functionality      |
| 6   | Payments                       | 🔴 Critical | Cash, Card, Fawry       |
| 7   | Shifts & Cash Register         | 🔴 Critical | Daily operations        |
| 8   | Basic Taxes                    | 🔴 Critical | VAT 14% (مصر)           |
| 9   | Basic Reports                  | 🟡 High     | Sales, Daily summary    |
| 10  | Audit Logs                     | 🟡 High     | Security & compliance   |

### المرحلة الثانية (Core Features) ⏱️ 4-6 أسابيع

| #   | Feature                | Priority    | Notes                          |
| --- | ---------------------- | ----------- | ------------------------------ |
| 11  | Customers              | 🟡 High     | Customer management            |
| 12  | Discounts & Promotions | 🟡 High     | Coupons, offers                |
| 13  | Inventory Management   | 🟡 High     | Stock tracking                 |
| 14  | Modifiers              | 🟡 High     | Product add-ons                |
| 15  | Suppliers              | 🟡 High     | Supplier management            |
| 16  | Purchase Orders        | 🟡 High     | Stock replenishment            |
| 17  | ETA E-Invoicing        | 🔴 Critical | Egypt compliance (إلزامي)      |
| 18  | Advanced Reports       | 🟢 Medium   | Products, Inventory, Employees |

### المرحلة الثالثة (Restaurant Features) ⏱️ 4-6 أسابيع

| #   | Feature                   | Priority  | Notes             |
| --- | ------------------------- | --------- | ----------------- |
| 19  | Tables Management         | 🟡 High   | For dine-in       |
| 20  | Kitchen Display (KDS)     | 🟡 High   | Order preparation |
| 21  | Reservations              | 🟢 Medium | Table booking     |
| 22  | Recipes/BOM               | 🟢 Medium | Cost calculation  |
| 23  | Notifications (Real-time) | 🟡 High   | WebSocket         |
| 24  | Webhooks                  | 🟢 Medium | Integrations      |

### المرحلة الرابعة (Offline & Sync) ⏱️ 4-6 أسابيع

| #   | Feature          | Priority | Notes                          |
| --- | ---------------- | -------- | ------------------------------ |
| 25  | Offline Mode     | 🟡 High  | IndexedDB, Service Worker      |
| 26  | Sync Engine      | 🟡 High  | Push/Pull, Conflict resolution |
| 27  | Queue Management | 🟡 High  | Offline orders queue           |

### المرحلة الخامسة (التكامل) ⏱️ 4-6 أسابيع

| #   | Feature            | Priority  | Notes                |
| --- | ------------------ | --------- | -------------------- |
| 28  | ERP Integration    | 🟢 Medium | Odoo, SAP, etc.      |
| 29  | Payment Gateways   | 🟢 Medium | Tap, Moyasar         |
| 30  | Delivery Apps      | 🟢 Medium | Hungerstation, Jahez |
| 31  | Loyalty Program    | 🟢 Medium | Points, Rewards      |
| 32  | Advanced Analytics | 🟢 Medium | Dashboard, BI        |

---

## 📋 Critical Action Items (قائمة المهام الحرجة)

### 🔴 Must Fix Before Development (مطلوب قبل بدء التطوير)

| #   | Issue                                     | Priority    | Impact                 | Status |
| --- | ----------------------------------------- | ----------- | ---------------------- | ------ |
| 1   | Add `tenant_id` to all entities           | 🔴 Critical | Data isolation         | ✅     |
| 2   | Implement Idempotency for orders/payments | 🔴 Critical | Prevent double charges | ⬜     |
| 3   | Add price/tax snapshots to orders         | 🔴 Critical | Financial accuracy     | ✅     |
| 4   | Define order state machine                | 🔴 Critical | Business logic         | ✅     |
| 5   | Implement audit logging                   | 🔴 Critical | Compliance             | ✅     |

### 🟡 Must Fix Before Launch (مطلوب قبل الإطلاق)

| #   | Issue                              | Priority | Impact           | Status |
| --- | ---------------------------------- | -------- | ---------------- | ------ |
| 6   | Implement sync conflict resolution | 🟡 High  | Offline support  | ⬜     |
| 7   | Add permission constraints         | 🟡 High  | Security         | ⬜     |
| 8   | Define complete error codes        | 🟡 High  | Frontend UX      | ✅     |
| 9   | Set up rate limiting               | 🟡 High  | System stability | ⬜     |
| 10  | API versioning strategy            | 🟡 High  | Future updates   | ⬜     |

### 🟢 Nice to Have (اختياري)

| #   | Issue                    | Priority  | Impact       | Status |
| --- | ------------------------ | --------- | ------------ | ------ |
| 11  | Performance optimization | 🟢 Medium | Scalability  | ⬜     |
| 12  | Advanced reporting       | 🟢 Medium | Analytics    | ⬜     |
| 13  | Webhook system           | 🟢 Low    | Integrations | ⬜     |

### 🏁 Next Steps (الخطوات التالية)

1. **Update Database Schema** مع tenant_id و snapshots
2. **Create Core Middleware**:
   - Tenant resolution
   - Idempotency
   - Rate limiting
   - Audit logging
3. **Define State Machines** للطلبات والورديات والمخزون
4. **Build Sync Engine** مع conflict resolution
5. **Create Permission System** مع constraints
6. **Setup ETA Integration** للفوترة الإلكترونية

---

## 📋 Checklist للتحقق قبل الإطلاق

### Security ✅

- [x] JWT with refresh tokens
- [x] Role-based access control
- [x] Audit logging
- [ ] Rate limiting
- [x] Input validation
- [x] SQL injection prevention
- [x] XSS prevention

### Multi-Tenant ✅

- [x] Tenant isolation
- [x] Global query filters
- [ ] Tenant-aware caching
- [ ] Data backup per tenant

### Offline ✅

- [ ] Offline storage (IndexedDB)
- [ ] Sync queue
- [ ] Conflict resolution
- [ ] Idempotency keys

### Compliance ✅

- [ ] ETA E-Invoicing ready (منظومة الفاتورة الإلكترونية المصرية)
- [ ] Invoice QR codes
- [x] Tax snapshots
- [x] Audit trail

### Performance ✅

- [x] Database indexing
- [x] Pagination
- [ ] Caching strategy
- [ ] Response compression

---

> 📌 **ملاحظة:** هذا الدليل يغطي جميع الـ Endpoints المطلوبة لبناء نظام كاشير احترافي متكامل ينافس Foodics وأنظمة الـ POS العالمية. تم تصميمه ليدعم:
>
> - ✅ Multi-Tenant SaaS
> - ✅ Offline-First Architecture
> - ✅ Multi-Branch Operations
> - ✅ ETA E-Invoicing Compliance (الفوترة الإلكترونية المصرية)
> - ✅ Restaurant & Retail Support
