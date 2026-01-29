# مراجعة وتصحيحات: المصروفات والخزينة

## تاريخ المراجعة: 29 يناير 2026

---

## ✅ ما تمت مراجعته

### 1. الكود الموجود (Existing Codebase)
- ✅ BaseEntity pattern
- ✅ Domain Entities (Shift, Order, Product, Supplier, Payment, StockMovement, PurchaseInvoice)
- ✅ Enums (PaymentMethod, StockMovementType, PurchaseInvoiceStatus)
- ✅ ErrorCodes pattern
- ✅ Multi-tenancy pattern (TenantId + BranchId)
- ✅ Navigation properties pattern
- ✅ Audit fields pattern (CreatedByUserId, CreatedByUserName, etc.)

### 2. الأنماط المستخدمة (Patterns Found)
- ✅ Clean Architecture (Domain → Infrastructure → Application → API)
- ✅ Tax Exclusive Model (Subtotal + Tax = Total)
- ✅ Snapshot pattern (SupplierName, BranchName في الفواتير)
- ✅ State transitions (Draft → Approved → Paid)
- ✅ Concurrency control (RowVersion في Shift)
- ✅ Soft delete (IsDeleted flag)
- ✅ Timestamps (CreatedAt, UpdatedAt)

---

## 🔧 التصحيحات المطلوبة

### 1. Shift Entity - إضافة حقول الخزينة

**المشكلة**: الـ Shift الحالي لديه حقول مالية عامة لكن ليس لديه حقول خاصة بالخزينة النقدية.

**الحقول الموجودة**:
```csharp
public decimal OpeningBalance { get; set; }
public decimal ClosingBalance { get; set; }
public decimal ExpectedBalance { get; set; }
public decimal Difference { get; set; }
public decimal TotalCash { get; set; }
public decimal TotalCard { get; set; }
```

**الحقول المطلوب إضافتها**:
```csharp
// Cash Register specific fields
public decimal? OpeningCashBalance { get; set; }
public decimal? ClosingCashBalance { get; set; }
public decimal? ExpectedCashBalance { get; set; }
public decimal? ActualCashBalance { get; set; }
public decimal? CashVariance { get; set; }
public string? VarianceReason { get; set; }
public bool IsReconciled { get; set; } = false;
public int? ReconciledByUserId { get; set; }
public string? ReconciledByUserName { get; set; }
public DateTime? ReconciledAt { get; set; }
```

**ملاحظة**: الحقول الموجودة كافية! فقط نحتاج لإضافة:
- `IsReconciled`
- `ReconciledByUserId`
- `ReconciledByUserName`
- `ReconciledAt`
- `VarianceReason` (إذا لم يكن موجود)

**التصحيح**: تحديث design.md لاستخدام الحقول الموجودة بدلاً من إنشاء حقول جديدة.

---

### 2. PaymentMethod Enum - إضافة BankTransfer

**المشكلة**: الـ enum الحالي يحتوي على:
```csharp
Cash = 0,
Card = 1,
Fawry = 2
```

**المطلوب**: إضافة `BankTransfer = 3` للمصروفات.

**التصحيح**: تحديث الـ enum في Domain Layer.

---

### 3. CashRegisterTransactionType Enum - مراجعة الأنواع

**المقترح في design.md**:
```
Opening, Deposit, Withdrawal, Sale, Refund, Expense, SupplierPayment, Adjustment, Transfer
```

**التصحيح**: هذا صحيح ومتوافق مع StockMovementType pattern.

---

### 4. ExpenseCategory - التصنيفات الافتراضية

**المقترح**: 
- Utilities (المرافق)
- Salaries (الرواتب)
- Rent (الإيجار)
- Supplies (المستلزمات)
- Maintenance (الصيانة)
- Other (أخرى)

**التصحيح**: إضافة `IsSystem` flag للتصنيفات الافتراضية (مثل Category entity).

---

### 5. Error Codes - الترقيم

**المشكلة**: آخر رقم مستخدم هو 5199 (Supplier Product).

**المقترح للمصروفات**: 5200-5299
**المقترح للخزينة**: 5300-5399

**Error Codes المطلوبة**:

```csharp
// Expense Errors (5200-5299)
public const string EXPENSE_NOT_FOUND = "EXPENSE_NOT_FOUND";
public const string EXPENSE_CATEGORY_NOT_FOUND = "EXPENSE_CATEGORY_NOT_FOUND";
public const string EXPENSE_NOT_EDITABLE = "EXPENSE_NOT_EDITABLE";
public const string EXPENSE_NOT_DELETABLE = "EXPENSE_NOT_DELETABLE";
public const string EXPENSE_ALREADY_APPROVED = "EXPENSE_ALREADY_APPROVED";
public const string EXPENSE_ALREADY_PAID = "EXPENSE_ALREADY_PAID";
public const string EXPENSE_ALREADY_REJECTED = "EXPENSE_ALREADY_REJECTED";
public const string EXPENSE_NOT_APPROVED = "EXPENSE_NOT_APPROVED";
public const string EXPENSE_INVALID_AMOUNT = "EXPENSE_INVALID_AMOUNT";
public const string EXPENSE_REJECTION_REASON_REQUIRED = "EXPENSE_REJECTION_REASON_REQUIRED";
public const string EXPENSE_ATTACHMENT_TOO_LARGE = "EXPENSE_ATTACHMENT_TOO_LARGE";
public const string EXPENSE_ATTACHMENT_INVALID_TYPE = "EXPENSE_ATTACHMENT_INVALID_TYPE";
public const string EXPENSE_CATEGORY_IN_USE = "EXPENSE_CATEGORY_IN_USE";
public const string EXPENSE_CATEGORY_IS_SYSTEM = "EXPENSE_CATEGORY_IS_SYSTEM";

// Cash Register Errors (5300-5399)
public const string CASH_REGISTER_INSUFFICIENT_BALANCE = "CASH_REGISTER_INSUFFICIENT_BALANCE";
public const string CASH_REGISTER_TRANSACTION_NOT_FOUND = "CASH_REGISTER_TRANSACTION_NOT_FOUND";
public const string CASH_REGISTER_INVALID_AMOUNT = "CASH_REGISTER_INVALID_AMOUNT";
public const string CASH_REGISTER_ALREADY_RECONCILED = "CASH_REGISTER_ALREADY_RECONCILED";
public const string CASH_REGISTER_NOT_RECONCILED = "CASH_REGISTER_NOT_RECONCILED";
public const string CASH_REGISTER_TRANSFER_SAME_BRANCH = "CASH_REGISTER_TRANSFER_SAME_BRANCH";
public const string CASH_REGISTER_RECONCILIATION_REQUIRED = "CASH_REGISTER_RECONCILIATION_REQUIRED";
```

---

### 6. ExpenseNumber Generation Pattern

**المقترح**: `EXP-{Year}-{SequentialNumber}`

**مثال**: `EXP-2026-0001`

**التصحيح**: متوافق مع PurchaseInvoice pattern (`PI-{Year}-{SequentialNumber}`).

---

### 7. CashRegisterTransaction Number Pattern

**المقترح**: `CRT-{Year}-{SequentialNumber}`

**مثال**: `CRT-2026-0001`

**التصحيح**: إضافة هذا للـ design.md.

---

### 8. File Upload Path

**المقترح**: `uploads/{tenantId}/expenses/{expenseId}/`

**التصحيح**: يجب التأكد من:
- إنشاء المجلدات تلقائياً
- حماية الملفات (Authorization)
- تنظيف الملفات عند حذف المصروف

---

### 9. Integration with Existing Services

**المطلوب تعديله**:

#### ShiftService
- ✅ `OpenShiftAsync`: إضافة Opening cash transaction
- ✅ `CloseShiftAsync`: إضافة Reconciliation logic
- ✅ Shift report: إضافة Cash Register summary

#### OrderService
- ✅ `CreateOrderAsync`: إذا Cash payment → Create Sale transaction
- ✅ Refund logic: إذا Cash refund → Create Refund transaction

#### PurchaseInvoiceService
- ✅ `AddPaymentAsync`: إذا Cash payment → Create SupplierPayment transaction

---

### 10. Database Indexes

**المطلوب إضافتها**:

```sql
-- Expenses
CREATE INDEX IX_Expenses_TenantId_BranchId ON Expenses(TenantId, BranchId);
CREATE INDEX IX_Expenses_Status ON Expenses(Status);
CREATE INDEX IX_Expenses_ExpenseDate ON Expenses(ExpenseDate);
CREATE INDEX IX_Expenses_CategoryId ON Expenses(CategoryId);
CREATE INDEX IX_Expenses_ShiftId ON Expenses(ShiftId);
CREATE INDEX IX_Expenses_ExpenseNumber ON Expenses(ExpenseNumber);

-- ExpenseCategories
CREATE INDEX IX_ExpenseCategories_TenantId ON ExpenseCategories(TenantId);
CREATE INDEX IX_ExpenseCategories_IsActive ON ExpenseCategories(IsActive);

-- CashRegisterTransactions
CREATE INDEX IX_CashRegisterTransactions_TenantId_BranchId ON CashRegisterTransactions(TenantId, BranchId);
CREATE INDEX IX_CashRegisterTransactions_Type ON CashRegisterTransactions(Type);
CREATE INDEX IX_CashRegisterTransactions_TransactionDate ON CashRegisterTransactions(TransactionDate);
CREATE INDEX IX_CashRegisterTransactions_ShiftId ON CashRegisterTransactions(ShiftId);
CREATE INDEX IX_CashRegisterTransactions_ReferenceType_ReferenceId ON CashRegisterTransactions(ReferenceType, ReferenceId);
CREATE INDEX IX_CashRegisterTransactions_TransactionNumber ON CashRegisterTransactions(TransactionNumber);
```

---

## 📋 قائمة التحقق النهائية

### Domain Layer
- [ ] إضافة `BankTransfer` إلى `PaymentMethod` enum
- [ ] إنشاء `ExpenseStatus` enum
- [ ] إنشاء `CashRegisterTransactionType` enum
- [ ] إنشاء `ExpenseCategory` entity
- [ ] إنشاء `Expense` entity
- [ ] إنشاء `ExpenseAttachment` entity
- [ ] إنشاء `CashRegisterTransaction` entity
- [ ] تحديث `Shift` entity (إضافة Reconciliation fields)

### Application Layer
- [ ] إضافة Error Codes للمصروفات (5200-5299)
- [ ] إضافة Error Codes للخزينة (5300-5399)
- [ ] إضافة Arabic error messages

### Infrastructure Layer
- [ ] إنشاء Migration
- [ ] إنشاء Entity Configurations
- [ ] إضافة Indexes
- [ ] Seed التصنيفات الافتراضية

### Integration
- [ ] تحديث `ShiftService`
- [ ] تحديث `OrderService`
- [ ] تحديث `PurchaseInvoiceService`

---

## ✅ التوصيات

### 1. استخدام الحقول الموجودة في Shift
بدلاً من إضافة حقول جديدة، استخدم:
- `OpeningBalance` → Opening cash balance
- `ClosingBalance` → Closing cash balance
- `ExpectedBalance` → Expected cash balance
- `Difference` → Cash variance

فقط أضف:
- `IsReconciled`
- `ReconciledByUserId`
- `ReconciledByUserName`
- `ReconciledAt`

### 2. Transaction Safety
تأكد من استخدام Transactions في:
- `ExpenseService.PayAsync` (إذا Cash → update cash register)
- `CashRegisterService.CreateTransactionAsync`
- `CashRegisterService.ReconcileAsync`
- `CashRegisterService.TransferCashAsync`

### 3. Audit Trail
سجل كل العمليات في AuditLog:
- Expense state changes
- Cash register transactions
- Reconciliations

### 4. Authorization
تأكد من الصلاحيات:
- Admin: كل العمليات
- Cashier: مصروفات صغيرة فقط (configurable limit)

### 5. Validation
- Backend: Data Annotations + Business Rules
- Frontend: Form Validation
- Error messages بالعربية

---

## 🎯 الخطوات التالية

1. **تحديث design.md** بالتصحيحات أعلاه
2. **تحديث tasks.md** لتعكس التغييرات
3. **البدء بالتنفيذ** من المرحلة 1

---

**الحالة**: ✅ المراجعة مكتملة  
**التاريخ**: 29 يناير 2026  
**المراجع**: Kiro AI
