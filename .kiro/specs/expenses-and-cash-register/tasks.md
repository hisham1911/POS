# خطة التنفيذ: المصروفات والخزينة

## نظرة عامة

خطة تنفيذ تفصيلية لميزتي المصروفات والخزينة في نظام KasserPro.

**المدة المتوقعة**: 4-5 أيام  
**الأولوية**: عالية

---

## المرحلة 1: Domain & Infrastructure (Backend Foundation)

### 1.1 إنشاء Enums الجديدة
- [ ] 1.1.1 إنشاء `ExpenseStatus` enum في `src/KasserPro.Domain/Enums/`
- [ ] 1.1.2 إنشاء `CashRegisterTransactionType` enum في `src/KasserPro.Domain/Enums/`

### 1.2 إنشاء Entities الجديدة
- [ ] 1.2.1 إنشاء `ExpenseCategory` entity في `src/KasserPro.Domain/Entities/`
- [ ] 1.2.2 إنشاء `Expense` entity في `src/KasserPro.Domain/Entities/`
- [ ] 1.2.3 إنشاء `ExpenseAttachment` entity في `src/KasserPro.Domain/Entities/`
- [ ] 1.2.4 إنشاء `CashRegisterTransaction` entity في `src/KasserPro.Domain/Entities/`

### 1.3 تعديل Entities الموجودة
- [ ] 1.3.1 إضافة Cash Register fields إلى `Shift` entity

### 1.4 تحديث Error Codes
- [ ] 1.4.1 إضافة Error Codes للمصروفات في `ErrorCodes.cs`
- [ ] 1.4.2 إضافة Error Codes للخزينة في `ErrorCodes.cs`

### 1.5 إنشاء Migration
- [ ] 1.5.1 إنشاء Migration: `dotnet ef migrations add AddExpensesAndCashRegister`
- [ ] 1.5.2 مراجعة Migration المُنشأة
- [ ] 1.5.3 تطبيق Migration: `dotnet ef database update`

### 1.6 إنشاء Entity Configurations
- [ ] 1.6.1 إنشاء `ExpenseCategoryConfiguration.cs`
- [ ] 1.6.2 إنشاء `ExpenseConfiguration.cs`
- [ ] 1.6.3 إنشاء `ExpenseAttachmentConfiguration.cs`
- [ ] 1.6.4 إنشاء `CashRegisterTransactionConfiguration.cs`
- [ ] 1.6.5 تحديث `ShiftConfiguration.cs`
- [ ] 1.6.6 تحديث `AppDbContext.OnModelCreating`

---

## المرحلة 2: Application Layer (Business Logic)

### 2.1 إنشاء DTOs للمصروفات
- [ ] 2.1.1 إنشاء Request DTOs في `DTOs/Expenses/`
  - CreateExpenseRequest
  - UpdateExpenseRequest
  - ApproveExpenseRequest
  - RejectExpenseRequest
  - PayExpenseRequest
- [ ] 2.1.2 إنشاء Response DTOs
  - ExpenseDto
  - ExpenseAttachmentDto
- [ ] 2.1.3 إنشاء DTOs للتصنيفات
  - CreateExpenseCategoryRequest
  - UpdateExpenseCategoryRequest
  - ExpenseCategoryDto

### 2.2 إنشاء DTOs للخزينة
- [ ] 2.2.1 إنشاء Request DTOs في `DTOs/CashRegister/`
  - CreateCashRegisterTransactionRequest
  - ReconcileCashRegisterRequest
  - TransferCashRequest
- [ ] 2.2.2 إنشاء Response DTOs
  - CashRegisterTransactionDto
  - CashRegisterBalanceDto
  - CashRegisterSummaryDto

### 2.3 إنشاء Service Interfaces
- [ ] 2.3.1 إنشاء `IExpenseService.cs`
- [ ] 2.3.2 إنشاء `IExpenseCategoryService.cs`
- [ ] 2.3.3 إنشاء `ICashRegisterService.cs`

### 2.4 تطبيق ExpenseService
- [ ] 2.4.1 إنشاء `ExpenseService.cs`
- [ ] 2.4.2 تطبيق `GetAllAsync` (مع Pagination و Filtering)
- [ ] 2.4.3 تطبيق `GetByIdAsync`
- [ ] 2.4.4 تطبيق `CreateAsync` (مع توليد ExpenseNumber)
- [ ] 2.4.5 تطبيق `UpdateAsync` (Draft only)
- [ ] 2.4.6 تطبيق `DeleteAsync` (Draft only)
- [ ] 2.4.7 تطبيق `ApproveAsync` (Admin only, state transition)
- [ ] 2.4.8 تطبيق `RejectAsync` (Admin only, requires reason)
- [ ] 2.4.9 تطبيق `PayAsync` (Approved only, update cash register if cash)
- [ ] 2.4.10 تطبيق `GetExpenseReportAsync`

### 2.5 تطبيق ExpenseCategoryService
- [ ] 2.5.1 إنشاء `ExpenseCategoryService.cs`
- [ ] 2.5.2 تطبيق CRUD operations
- [ ] 2.5.3 تطبيق Seed للتصنيفات الافتراضية

### 2.6 تطبيق CashRegisterService
- [ ] 2.6.1 إنشاء `CashRegisterService.cs`
- [ ] 2.6.2 تطبيق `GetCurrentBalanceAsync`
- [ ] 2.6.3 تطبيق `GetTransactionsAsync` (مع Pagination و Filtering)
- [ ] 2.6.4 تطبيق `CreateTransactionAsync` (مع حساب Balance)
- [ ] 2.6.5 تطبيق `ReconcileAsync` (Shift close, create Adjustment if variance)
- [ ] 2.6.6 تطبيق `TransferCashAsync` (create 2 linked transactions)
- [ ] 2.6.7 تطبيق `GetCashRegisterHistoryAsync`
- [ ] 2.6.8 تطبيق `GetCashRegisterSummaryAsync`

### 2.7 تسجيل Services في DI
- [ ] 2.7.1 تحديث `Program.cs` لإضافة Services الجديدة

---

## المرحلة 3: API Layer (Controllers)

### 3.1 إنشاء ExpensesController
- [ ] 3.1.1 إنشاء `ExpensesController.cs`
- [ ] 3.1.2 تطبيق GET /api/expenses
- [ ] 3.1.3 تطبيق GET /api/expenses/{id}
- [ ] 3.1.4 تطبيق POST /api/expenses
- [ ] 3.1.5 تطبيق PUT /api/expenses/{id}
- [ ] 3.1.6 تطبيق DELETE /api/expenses/{id}
- [ ] 3.1.7 تطبيق POST /api/expenses/{id}/approve
- [ ] 3.1.8 تطبيق POST /api/expenses/{id}/reject
- [ ] 3.1.9 تطبيق POST /api/expenses/{id}/pay
- [ ] 3.1.10 تطبيق POST /api/expenses/{id}/attachments
- [ ] 3.1.11 تطبيق DELETE /api/expenses/{id}/attachments/{attachmentId}
- [ ] 3.1.12 تطبيق GET /api/expenses/report

### 3.2 إنشاء ExpenseCategoriesController
- [ ] 3.2.1 إنشاء `ExpenseCategoriesController.cs`
- [ ] 3.2.2 تطبيق CRUD endpoints

### 3.3 إنشاء CashRegisterController
- [ ] 3.3.1 إنشاء `CashRegisterController.cs`
- [ ] 3.3.2 تطبيق GET /api/cash-register/balance
- [ ] 3.3.3 تطبيق GET /api/cash-register/transactions
- [ ] 3.3.4 تطبيق POST /api/cash-register/deposit
- [ ] 3.3.5 تطبيق POST /api/cash-register/withdraw
- [ ] 3.3.6 تطبيق POST /api/cash-register/reconcile
- [ ] 3.3.7 تطبيق POST /api/cash-register/transfer
- [ ] 3.3.8 تطبيق GET /api/cash-register/history
- [ ] 3.3.9 تطبيق GET /api/cash-register/summary

### 3.4 إضافة Authorization
- [ ] 3.4.1 التأكد من `[Authorize]` على كل الـ endpoints
- [ ] 3.4.2 إضافة Role-based authorization (Admin vs Cashier)

---

## المرحلة 4: Integration (ربط مع الميزات الموجودة)

### 4.1 تحديث ShiftService
- [x] 4.1.1 تعديل `OpenShiftAsync` لتسجيل Opening cash balance
- [x] 4.1.2 تعديل `CloseShiftAsync` لطلب Reconciliation
- [x] 4.1.3 إضافة Cash Register summary في Shift report

### 4.2 تحديث OrderService
- [x] 4.2.1 تعديل `CreateOrderAsync` لتحديث Cash Register (إذا Cash payment)
- [x] 4.2.2 تعديل Refund logic لتحديث Cash Register

### 4.3 تحديث PurchaseInvoiceService
- [x] 4.3.1 تعديل `AddPaymentAsync` لتحديث Cash Register (إذا Cash payment)

---

## المرحلة 5: Frontend - Types & API

### 5.1 إنشاء TypeScript Types
- [ ] 5.1.1 إنشاء `expense.types.ts`
  - ExpenseStatus type
  - Expense interface
  - ExpenseCategory interface
  - ExpenseAttachment interface
  - Request interfaces
- [ ] 5.1.2 إنشاء `cashRegister.types.ts`
  - CashRegisterTransactionType type
  - CashRegisterTransaction interface
  - CashRegisterBalance interface
  - Request interfaces

### 5.2 إنشاء RTK Query APIs
- [ ] 5.2.1 إنشاء `expenseApi.ts`
  - Queries: getExpenses, getExpenseById
  - Mutations: createExpense, updateExpense, deleteExpense, approveExpense, rejectExpense, payExpense
- [ ] 5.2.2 إنشاء `expenseCategoryApi.ts`
  - CRUD operations
- [ ] 5.2.3 إنشاء `cashRegisterApi.ts`
  - Queries: getBalance, getTransactions, getHistory, getSummary
  - Mutations: deposit, withdraw, reconcile, transfer

### 5.3 تسجيل APIs في Store
- [ ] 5.3.1 تحديث `store/index.ts`

---

## المرحلة 6: Frontend - Pages & Components

### 6.1 صفحات المصروفات
- [ ] 6.1.1 إنشاء `ExpensesPage.tsx` (قائمة المصروفات)
  - جدول مع Pagination
  - Filters (Category, Status, Date, Branch)
  - Search
  - أزرار Actions
- [ ] 6.1.2 إنشاء `ExpenseFormPage.tsx` (إنشاء/تعديل)
  - Form مع Validation
  - اختيار التصنيف
  - رفع المرفقات
- [ ] 6.1.3 إنشاء `ExpenseDetailsPage.tsx` (التفاصيل)
  - عرض كل التفاصيل
  - أزرار Approve/Reject/Pay
  - عرض المرفقات
  - Timeline للحالات
- [ ] 6.1.4 إنشاء `ExpenseCategoriesPage.tsx` (إدارة التصنيفات)

### 6.2 صفحات الخزينة
- [ ] 6.2.1 إنشاء `CashRegisterDashboard.tsx` (لوحة التحكم)
  - عرض الرصيد الحالي
  - ملخص اليوم
  - أزرار سريعة (Deposit/Withdraw)
- [ ] 6.2.2 إنشاء `CashRegisterTransactionsPage.tsx` (المعاملات)
  - جدول مع Pagination
  - Filters (Type, Date, Shift)
  - عرض Balance بعد كل معاملة
- [ ] 6.2.3 إنشاء `CashRegisterReportsPage.tsx` (التقارير)

### 6.3 Components
- [ ] 6.3.1 إنشاء `ApproveExpenseModal.tsx`
- [ ] 6.3.2 إنشاء `RejectExpenseModal.tsx`
- [ ] 6.3.3 إنشاء `PayExpenseModal.tsx`
- [ ] 6.3.4 إنشاء `AttachmentUploader.tsx`
- [ ] 6.3.5 إنشاء `ReconcileModal.tsx`
- [ ] 6.3.6 إنشاء `DepositWithdrawModal.tsx`
- [ ] 6.3.7 إنشاء `TransferCashModal.tsx`
- [ ] 6.3.8 إنشاء `CashRegisterBalance.tsx` (widget)

### 6.4 تحديث Navigation
- [ ] 6.4.1 إضافة Routes في `App.tsx`
- [ ] 6.4.2 إضافة روابط في Sidebar
- [ ] 6.4.3 إضافة Icons مناسبة

### 6.5 تحديث Shift Pages
- [ ] 6.5.1 تعديل `ShiftPage.tsx` لإضافة Opening cash balance
- [ ] 6.5.2 إضافة Reconciliation في Close shift modal
- [ ] 6.5.3 إضافة Cash Register summary في Shift report

---

## المرحلة 7: Testing & Documentation

### 7.1 Backend Tests
- [ ] 7.1.1 Unit Tests للـ ExpenseService
- [ ] 7.1.2 Unit Tests للـ CashRegisterService
- [ ] 7.1.3 Integration Tests للـ Expense workflows
- [ ] 7.1.4 Integration Tests للـ Cash Register workflows

### 7.2 Frontend Tests
- [ ] 7.2.1 E2E Test: Create and approve expense
- [ ] 7.2.2 E2E Test: Pay expense and verify cash register update
- [ ] 7.2.3 E2E Test: Cash register reconciliation

### 7.3 Documentation
- [ ] 7.3.1 تحديث API Documentation
- [ ] 7.3.2 إضافة User Guide للمصروفات
- [ ] 7.3.3 إضافة User Guide للخزينة

### 7.4 Manual Testing
- [ ] 7.4.1 اختبار كامل لـ Expense workflow
- [ ] 7.4.2 اختبار كامل لـ Cash Register
- [ ] 7.4.3 اختبار التكامل مع Shifts
- [ ] 7.4.4 اختبار التكامل مع Orders
- [ ] 7.4.5 اختبار التكامل مع Purchase Invoices

---

## ✅ معايير الإنجاز

الميزة تعتبر مكتملة عندما:

1. ✅ كل الـ Tasks أعلاه مكتملة
2. ✅ كل الـ Tests تعمل بنجاح
3. ✅ المصروفات تعمل بكل حالاتها (Draft → Approved → Paid)
4. ✅ الخزينة تتحدث تلقائياً مع كل المعاملات النقدية
5. ✅ التسوية تعمل بشكل صحيح
6. ✅ التكامل مع Shifts/Orders/Purchase Invoices يعمل
7. ✅ الصلاحيات تعمل بشكل صحيح (Admin vs Cashier)
8. ✅ Audit Trail كامل
9. ✅ لا توجد Bugs معروفة
10. ✅ Documentation محدثة

---

**تاريخ الإنشاء**: 29 يناير 2026  
**الحالة**: ✅ جاهز للتنفيذ
