---
inclusion: always
---

# KasserPro Architecture Rules

## 🏛️ المرجع الأساسي

- **Architecture Manifest:** `docs/KASSERPRO_ARCHITECTURE_MANIFEST.md`
- **API Documentation:** `docs/api/API_DOCUMENTATION.md`

---

## 🔄 Development Workflow

### النهج الموحد (قبل كتابة أي كود)

1. **Document First** - وثّق الـ API في `docs/api/API_DOCUMENTATION.md`
2. **Types Match** - Frontend Types = Backend DTOs
3. **Test Before Merge** - E2E tests must pass
4. **No Magic Strings** - استخدم Enums

### Checklist لكل Feature

```
Backend:
- [ ] Entity + Migration
- [ ] Repository + Service
- [ ] Controller + Validation
- [ ] Integration Test

Frontend:
- [ ] Types in types/*.ts
- [ ] RTK Query API
- [ ] Components + Pages
- [ ] E2E Test
```

---

## 💰 Financial Logic (Tax Exclusive)

```
NetTotal = UnitPrice * Quantity
TaxAmount = NetTotal * (TaxRate / 100)
TotalAmount = NetTotal + TaxAmount
```

**Default:** 14% Egypt VAT

---

## 🔒 Multi-Tenancy

- كل Entity: `TenantId` + `BranchId`
- استخدم `ICurrentUserService` - لا تكتب IDs يدوياً

---

## ✅ Validation Rules

| Rule | Error Code |
|------|------------|
| Product.Price >= 0 | `PRODUCT_INVALID_PRICE` |
| OrderItem.Quantity > 0 | `ORDER_INVALID_QUANTITY` |
| Order.Items.length > 0 | `ORDER_EMPTY` |
| Order.Status == Draft | `ORDER_NOT_EDITABLE` |
| Product.IsActive == true | `PRODUCT_INACTIVE` |
| Shift must be open | `NO_OPEN_SHIFT` |

---

## 🎯 Type Safety

```typescript
// ✅ صحيح
type OrderType = 'DineIn' | 'Takeaway' | 'Delivery';
type PaymentMethod = 'Cash' | 'Card' | 'Fawry';

// ❌ ممنوع
const orderType: any = "dine_in";
```

---

## 🧪 Testing

- **E2E Tests:** `client/e2e/complete-flow.spec.ts`
- **Integration Tests:** `src/KasserPro.Tests/`
- **Golden Rule:** ❌ لا تنشر إذا فشل أي E2E test

---

## 🔧 Configuration

| Service | Port |
|---------|------|
| Backend | 5243 |
| Frontend | 3000 |

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kasserpro.com | Admin@123 |
| Cashier | ahmed@kasserpro.com | 123456 |
