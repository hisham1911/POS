# خطة التنفيذ - الميزات الجاهزة للسوق

## نظرة عامة

هذا الملف يحتوي على خطة التنفيذ التفصيلية للميزات السبعة المطلوبة لجعل نظام KasserPro جاهزاً للسوق.

**استراتيجية التنفيذ**: ميزة بميزة (واحدة تلو الأخرى)

**الترتيب**:
1. ✅ فواتير الشراء وعلاقة المورد بالمنتج (نبدأ بها)
2. ⏳ المخزون الخاص بكل فرع
3. ⏳ التكامل مع الأجهزة (Desktop App)
4. ⏳ المصروفات
5. ⏳ الخزينة
6. ⏳ تحسينات الورديات
7. ⏳ بيانات الاختبار

---

# الميزة 1: فواتير الشراء وعلاقة المورد بالمنتج

**الحالة**: 🚀 جاري التنفيذ

**المدة المتوقعة**: 5-7 أيام

**الأولوية**: عالية جداً

---

## المرحلة 1: Database & Domain Layer

### 1.1 إنشاء Entities الجديدة

- [ ] 1.1.1 إنشاء `PurchaseInvoice` Entity
  - [ ] إضافة كل الـ properties حسب التصميم
  - [ ] إضافة Navigation properties
  - [ ] إضافة XML comments

- [ ] 1.1.2 إنشاء `PurchaseInvoiceItem` Entity
  - [ ] إضافة كل الـ properties
  - [ ] إضافة Navigation properties
  - [ ] إضافة XML comments

- [ ] 1.1.3 إنشاء `PurchaseInvoicePayment` Entity
  - [ ] إضافة كل الـ properties
  - [ ] إضافة Navigation properties
  - [ ] إضافة XML comments

- [ ] 1.1.4 إنشاء `SupplierProduct` Entity (Many-to-Many)
  - [ ] إضافة كل الـ properties
  - [ ] إضافة Navigation properties
  - [ ] إضافة XML comments

### 1.2 إنشاء Enums الجديدة

- [ ] 1.2.1 إنشاء `PurchaseInvoiceStatus` Enum
  - [ ] Draft, Confirmed, Paid, PartiallyPaid, Cancelled, Returned, PartiallyReturned
  - [ ] إضافة XML comments لكل قيمة

### 1.3 تعديل Entities الموجودة

- [ ] 1.3.1 تعديل `Product` Entity
  - [ ] إضافة `AverageCost` property
  - [ ] إضافة `LastPurchasePrice` property
  - [ ] إضافة `LastPurchaseDate` property
  - [ ] إضافة Navigation properties الجديدة

- [ ] 1.3.2 تعديل `Supplier` Entity
  - [ ] إضافة `TotalDue` property
  - [ ] إضافة `TotalPaid` property
  - [ ] إضافة `TotalPurchases` property
  - [ ] إضافة `LastPurchaseDate` property
  - [ ] إضافة Navigation properties الجديدة

### 1.4 تحديث Error Codes

- [ ] 1.4.1 إضافة Error Codes الجديدة في `ErrorCodes.cs`
  - [ ] PURCHASE_INVOICE_NOT_FOUND
  - [ ] PURCHASE_INVOICE_EMPTY
  - [ ] PURCHASE_INVOICE_INVALID_QUANTITY
  - [ ] PURCHASE_INVOICE_INVALID_PRICE
  - [ ] PURCHASE_INVOICE_NOT_EDITABLE
  - [ ] PURCHASE_INVOICE_NOT_DELETABLE
  - [ ] PURCHASE_INVOICE_ALREADY_CONFIRMED
  - [ ] PURCHASE_INVOICE_ALREADY_CANCELLED
  - [ ] PAYMENT_INVALID_AMOUNT
  - [ ] PAYMENT_EXCEEDS_DUE
  - [ ] SUPPLIER_PRODUCT_ALREADY_LINKED
  - [ ] SUPPLIER_PRODUCT_NOT_FOUND

---

## المرحلة 2: Infrastructure Layer

### 2.1 إنشاء Migration

- [ ] 2.1.1 إنشاء Migration جديدة
  ```bash
  dotnet ef migrations add AddPurchaseInvoiceFeature --project src/KasserPro.Infrastructure
  ```

- [ ] 2.1.2 مراجعة Migration المُنشأة
  - [ ] التأكد من إنشاء الجداول الجديدة
  - [ ] التأكد من إضافة الأعمدة للجداول الموجودة
  - [ ] التأكد من إنشاء الـ Indexes

- [ ] 2.1.3 تطبيق Migration
  ```bash
  dotnet ef database update --project src/KasserPro.Infrastructure
  ```

### 2.2 تكوين Entity Configurations

- [ ] 2.2.1 إنشاء `PurchaseInvoiceConfiguration.cs`
  - [ ] تكوين Indexes
  - [ ] تكوين Relationships
  - [ ] تكوين Delete Behaviors

- [ ] 2.2.2 إنشاء `SupplierProductConfiguration.cs`
  - [ ] تكوين Composite Index (SupplierId, ProductId)
  - [ ] تكوين Relationships
  - [ ] تكوين Delete Behaviors

- [ ] 2.2.3 تحديث `AppDbContext.OnModelCreating`
  - [ ] إضافة Configurations الجديدة

### 2.3 إنشاء Repositories (إذا لزم الأمر)

- [ ] 2.3.1 التأكد من أن `GenericRepository` يدعم كل العمليات المطلوبة
- [ ] 2.3.2 إنشاء Repository methods خاصة إذا لزم الأمر
  - [ ] `GetLastInvoiceForYear` (لتوليد رقم الفاتورة)
  - [ ] `GetBySupplierAndProductAsync` (للـ SupplierProduct)

---

## المرحلة 3: Application Layer

### 3.1 إنشاء DTOs

- [ ] 3.1.1 إنشاء Request DTOs في `DTOs/PurchaseInvoices/`
  - [ ] `CreatePurchaseInvoiceRequest.cs`
  - [ ] `CreatePurchaseInvoiceItemRequest.cs`
  - [ ] `UpdatePurchaseInvoiceRequest.cs`
  - [ ] `UpdatePurchaseInvoiceItemRequest.cs`
  - [ ] `AddPaymentRequest.cs`
  - [ ] `CancelInvoiceRequest.cs`
  - [ ] `LinkSupplierProductRequest.cs`

- [ ] 3.1.2 إنشاء Response DTOs
  - [ ] `PurchaseInvoiceDto.cs`
  - [ ] `PurchaseInvoiceItemDto.cs`
  - [ ] `PurchaseInvoicePaymentDto.cs`
  - [ ] `SupplierProductDto.cs`

### 3.2 إنشاء Service Interface

- [ ] 3.2.1 إنشاء `IPurchaseInvoiceService.cs`
  - [ ] CRUD methods
  - [ ] State transition methods (Confirm, Cancel)
  - [ ] Payment methods
  - [ ] Report methods

- [ ] 3.2.2 إنشاء `ISupplierProductService.cs`
  - [ ] Link/Unlink methods
  - [ ] Set preferred supplier
  - [ ] Compare prices

### 3.3 تطبيق Service Implementation

- [ ] 3.3.1 إنشاء `PurchaseInvoiceService.cs`
  - [ ] `GetAllAsync` - مع Pagination و Filtering
  - [ ] `GetByIdAsync` - مع Include للـ Items و Payments
  - [ ] `CreateAsync` - مع حساب Totals
  - [ ] `UpdateAsync` - مع Validation (Draft only)
  - [ ] `DeleteAsync` - مع Validation (Draft only)
  - [ ] `ConfirmAsync` - **مهم جداً** (تحديث المخزون + Transactions)
  - [ ] `CancelAsync` - مع خيار تعديل المخزون
  - [ ] `AddPaymentAsync` - مع تحديث Status
  - [ ] `DeletePaymentAsync` - مع تحديث Status
  - [ ] `GetAccountsPayableReportAsync`
  - [ ] `GetSupplierPurchaseHistoryAsync`

- [ ] 3.3.2 إنشاء `SupplierProductService.cs`
  - [ ] `GetProductsForSupplierAsync`
  - [ ] `GetSuppliersForProductAsync`
  - [ ] `LinkProductToSupplierAsync`
  - [ ] `UnlinkProductFromSupplierAsync`
  - [ ] `SetPreferredSupplierAsync`
  - [ ] `CompareSupplierPricesAsync`

### 3.4 Business Rules Implementation

- [ ] 3.4.1 تطبيق Invoice Number Generation
  - [ ] Format: `PI-{Year}-{SequentialNumber}`
  - [ ] Reset sequence كل سنة

- [ ] 3.4.2 تطبيق Tax Calculation (Tax Exclusive)
  - [ ] Subtotal = sum of items
  - [ ] TaxAmount = Subtotal * (TaxRate / 100)
  - [ ] Total = Subtotal + TaxAmount

- [ ] 3.4.3 تطبيق Status Transitions Validation
  - [ ] Draft → Confirmed ✅
  - [ ] Draft → Cancelled ✅
  - [ ] Confirmed → PartiallyPaid ✅
  - [ ] Confirmed → Paid ✅
  - [ ] Confirmed → Cancelled ✅
  - [ ] PartiallyPaid → Paid ✅
  - [ ] PartiallyPaid → Cancelled ✅

- [ ] 3.4.4 تطبيق Inventory Update on Confirmation
  - [ ] زيادة StockQuantity لكل منتج
  - [ ] تحديث LastPurchasePrice
  - [ ] تحديث LastPurchaseDate
  - [ ] حساب AverageCost (weighted average)
  - [ ] إنشاء StockMovement records
  - [ ] تحديث SupplierProduct statistics
  - [ ] تحديث Supplier totals
  - [ ] **كل شيء في Transaction واحدة**

- [ ] 3.4.5 تطبيق Cancellation with Inventory Adjustment
  - [ ] إذا Confirmed و AdjustInventory = true: إنقاص المخزون
  - [ ] إنشاء StockMovement للتوثيق
  - [ ] تحديث Supplier totals
  - [ ] **كل شيء في Transaction واحدة**

- [ ] 3.4.6 تطبيق Payment Processing
  - [ ] Validation: Amount > 0
  - [ ] Validation: Amount <= AmountDue
  - [ ] تحديث AmountPaid و AmountDue
  - [ ] تحديث Status (PartiallyPaid / Paid)
  - [ ] تحديث Supplier.TotalPaid و TotalDue
  - [ ] **كل شيء في Transaction واحدة**

### 3.5 تسجيل Services في DI Container

- [ ] 3.5.1 تحديث `Program.cs` أو `ServiceCollectionExtensions.cs`
  - [ ] `services.AddScoped<IPurchaseInvoiceService, PurchaseInvoiceService>()`
  - [ ] `services.AddScoped<ISupplierProductService, SupplierProductService>()`

---

## المرحلة 4: API Layer

### 4.1 إنشاء Controllers

- [ ] 4.1.1 إنشاء `PurchaseInvoicesController.cs`
  - [ ] `GET /api/purchase-invoices` - GetAll (paginated)
  - [ ] `GET /api/purchase-invoices/{id}` - GetById
  - [ ] `POST /api/purchase-invoices` - Create
  - [ ] `PUT /api/purchase-invoices/{id}` - Update
  - [ ] `DELETE /api/purchase-invoices/{id}` - Delete
  - [ ] `POST /api/purchase-invoices/{id}/confirm` - Confirm
  - [ ] `POST /api/purchase-invoices/{id}/cancel` - Cancel
  - [ ] `POST /api/purchase-invoices/{id}/payments` - AddPayment
  - [ ] `DELETE /api/purchase-invoices/{id}/payments/{paymentId}` - DeletePayment

- [ ] 4.1.2 إضافة Endpoints للـ Supplier Products
  - [ ] `GET /api/suppliers/{id}/products` - GetProductsForSupplier
  - [ ] `POST /api/suppliers/{id}/products` - LinkProduct
  - [ ] `DELETE /api/suppliers/{supplierId}/products/{productId}` - UnlinkProduct
  - [ ] `PUT /api/suppliers/{supplierId}/products/{productId}/preferred` - SetPreferred

### 4.2 إضافة Authorization

- [ ] 4.2.1 التأكد من `[Authorize(Roles = "Admin")]` على كل الـ endpoints
- [ ] 4.2.2 التأكد من استخدام `ICurrentUserService` للحصول على TenantId و UserId

### 4.3 إضافة Validation

- [ ] 4.3.1 إضافة Data Annotations على Request DTOs
- [ ] 4.3.2 إضافة FluentValidation (اختياري) للـ validation المعقدة

---

## المرحلة 5: Frontend - Types & API

### 5.1 إنشاء TypeScript Types

- [ ] 5.1.1 إنشاء `client/src/types/purchaseInvoice.types.ts`
  - [ ] `PurchaseInvoiceStatus` type
  - [ ] `PurchaseInvoice` interface
  - [ ] `PurchaseInvoiceItem` interface
  - [ ] `PurchaseInvoicePayment` interface
  - [ ] `CreatePurchaseInvoiceRequest` interface
  - [ ] `CreatePurchaseInvoiceItemRequest` interface
  - [ ] `AddPaymentRequest` interface
  - [ ] `CancelInvoiceRequest` interface
  - [ ] `SupplierProduct` interface

### 5.2 إنشاء RTK Query API

- [ ] 5.2.1 إنشاء `client/src/api/purchaseInvoiceApi.ts`
  - [ ] `getPurchaseInvoices` query
  - [ ] `getPurchaseInvoiceById` query
  - [ ] `createPurchaseInvoice` mutation
  - [ ] `updatePurchaseInvoice` mutation
  - [ ] `deletePurchaseInvoice` mutation
  - [ ] `confirmPurchaseInvoice` mutation
  - [ ] `cancelPurchaseInvoice` mutation
  - [ ] `addPayment` mutation
  - [ ] `deletePayment` mutation

- [ ] 5.2.2 إنشاء `client/src/api/supplierProductApi.ts`
  - [ ] `getProductsForSupplier` query
  - [ ] `getSuppliersForProduct` query
  - [ ] `linkProductToSupplier` mutation
  - [ ] `unlinkProductFromSupplier` mutation
  - [ ] `setPreferredSupplier` mutation

### 5.3 تسجيل APIs في Store

- [ ] 5.3.1 تحديث `client/src/store/index.ts`
  - [ ] إضافة `purchaseInvoiceApi.reducerPath`
  - [ ] إضافة `supplierProductApi.reducerPath`
  - [ ] إضافة middleware

---

## المرحلة 6: Frontend - Components & Pages

### 6.1 صفحة قائمة فواتير الشراء

- [ ] 6.1.1 إنشاء `client/src/pages/purchase-invoices/PurchaseInvoicesPage.tsx`
  - [ ] عرض جدول بكل الفواتير
  - [ ] Pagination
  - [ ] Filtering (حسب المورد، الحالة، التاريخ)
  - [ ] Search
  - [ ] زر "إنشاء فاتورة جديدة"
  - [ ] أزرار Actions (عرض، تعديل، حذف، تأكيد، إلغاء)

### 6.2 صفحة إنشاء/تعديل فاتورة الشراء

- [ ] 6.2.1 إنشاء `client/src/pages/purchase-invoices/PurchaseInvoiceFormPage.tsx`
  - [ ] Form لإدخال بيانات الفاتورة
  - [ ] اختيار المورد (مع خيار إنشاء مورد جديد)
  - [ ] جدول لإضافة المنتجات
  - [ ] لكل منتج: اختيار المنتج، الكمية، سعر الشراء
  - [ ] حساب الإجمالي تلقائياً
  - [ ] حساب الضريبة تلقائياً
  - [ ] زر حفظ (Draft)
  - [ ] زر تأكيد (إذا كان Admin)

### 6.3 صفحة تفاصيل الفاتورة

- [ ] 6.3.1 إنشاء `client/src/pages/purchase-invoices/PurchaseInvoiceDetailsPage.tsx`
  - [ ] عرض كل تفاصيل الفاتورة
  - [ ] عرض جدول المنتجات
  - [ ] عرض قائمة الدفعات
  - [ ] زر "إضافة دفعة" (إذا AmountDue > 0)
  - [ ] زر "تأكيد" (إذا Draft)
  - [ ] زر "إلغاء" (مع modal للسؤال عن المخزون)
  - [ ] زر "تعديل" (إذا Draft)
  - [ ] زر "حذف" (إذا Draft)
  - [ ] زر "طباعة"

### 6.4 Modal إضافة دفعة

- [ ] 6.4.1 إنشاء `client/src/components/purchase-invoices/AddPaymentModal.tsx`
  - [ ] Form لإدخال بيانات الدفعة
  - [ ] المبلغ (مع validation: <= AmountDue)
  - [ ] التاريخ
  - [ ] طريقة الدفع
  - [ ] رقم المرجع (اختياري)
  - [ ] ملاحظات (اختياري)
  - [ ] زر حفظ

### 6.5 Modal إلغاء الفاتورة

- [ ] 6.5.1 إنشاء `client/src/components/purchase-invoices/CancelInvoiceModal.tsx`
  - [ ] Form لإدخال سبب الإلغاء
  - [ ] Checkbox: "تعديل المخزون" (إذا Confirmed)
  - [ ] تنبيه: إذا تم اختيار تعديل المخزون، سيتم إنقاص الكميات
  - [ ] زر تأكيد الإلغاء

### 6.6 Modal إنشاء مورد سريع

- [ ] 6.6.1 إنشاء `client/src/components/purchase-invoices/QuickCreateSupplierModal.tsx`
  - [ ] Form بسيط لإنشاء مورد
  - [ ] الاسم (مطلوب)
  - [ ] الهاتف (اختياري)
  - [ ] العنوان (اختياري)
  - [ ] زر حفظ
  - [ ] بعد الحفظ: إغلاق Modal واختيار المورد الجديد تلقائياً

### 6.7 Modal إنشاء منتج سريع

- [ ] 6.7.1 إنشاء `client/src/components/purchase-invoices/QuickCreateProductModal.tsx`
  - [ ] Form بسيط لإنشاء منتج
  - [ ] الاسم (مطلوب)
  - [ ] التصنيف (مطلوب)
  - [ ] سعر البيع (مطلوب)
  - [ ] SKU (اختياري)
  - [ ] Barcode (اختياري)
  - [ ] زر حفظ
  - [ ] بعد الحفظ: إغلاق Modal واختيار المنتج الجديد تلقائياً

### 6.8 إضافة Route في Navigation

- [ ] 6.8.1 تحديث `client/src/App.tsx`
  - [ ] إضافة Route لـ `/purchase-invoices`
  - [ ] إضافة Route لـ `/purchase-invoices/new`
  - [ ] إضافة Route لـ `/purchase-invoices/:id`
  - [ ] إضافة Route لـ `/purchase-invoices/:id/edit`

- [ ] 6.8.2 تحديث Sidebar Navigation
  - [ ] إضافة رابط "فواتير الشراء" في القائمة الجانبية
  - [ ] Icon مناسب
  - [ ] عرض فقط للـ Admin

---

## المرحلة 7: Testing

### 7.1 Unit Tests (Backend)

- [ ] 7.1.1 إنشاء `PurchaseInvoiceServiceTests.cs`
  - [ ] Test: `CalculateTotals_TaxExclusive_CalculatesCorrectly`
  - [ ] Test: `ConfirmAsync_UpdatesInventoryCorrectly`
  - [ ] Test: `CancelAsync_WithAdjustInventory_DecreasesStock`
  - [ ] Test: `AddPaymentAsync_UpdatesStatusCorrectly`
  - [ ] Test: `GenerateInvoiceNumber_GeneratesCorrectFormat`

### 7.2 Integration Tests (Backend)

- [ ] 7.2.1 إنشاء `PurchaseInvoiceIntegrationTests.cs`
  - [ ] Test: `CreatePurchaseInvoice_ValidData_ReturnsSuccess`
  - [ ] Test: `ConfirmPurchaseInvoice_UpdatesInventoryAndSupplier`
  - [ ] Test: `CancelPurchaseInvoice_WithInventoryAdjustment_RevertsStock`
  - [ ] Test: `AddPayment_UpdatesInvoiceStatus`

### 7.3 E2E Tests (Frontend)

- [ ] 7.3.1 إنشاء `client/e2e/purchase-invoice.spec.ts`
  - [ ] Test: `Admin can create and confirm purchase invoice`
  - [ ] Test: `Admin can cancel invoice with inventory adjustment`
  - [ ] Test: `Admin can add payment to invoice`
  - [ ] Test: `Cannot edit confirmed invoice`

---

## المرحلة 8: Documentation & Review

### 8.1 تحديث API Documentation

- [ ] 8.1.1 تحديث `docs/api/API_DOCUMENTATION.md`
  - [ ] إضافة كل الـ endpoints الجديدة
  - [ ] إضافة Request/Response examples
  - [ ] إضافة Error codes

### 8.2 Code Review

- [ ] 8.2.1 مراجعة الكود
  - [ ] التأكد من اتباع Clean Architecture
  - [ ] التأكد من استخدام Transactions في كل مكان مناسب
  - [ ] التأكد من Audit Trail
  - [ ] التأكد من Multi-Tenancy
  - [ ] التأكد من Error Handling

### 8.3 Testing Review

- [ ] 8.3.1 تشغيل كل الـ Tests
  - [ ] Unit Tests
  - [ ] Integration Tests
  - [ ] E2E Tests

### 8.4 Manual Testing

- [ ] 8.4.1 اختبار يدوي شامل
  - [ ] إنشاء فاتورة شراء
  - [ ] تأكيد الفاتورة والتحقق من تحديث المخزون
  - [ ] إضافة دفعات
  - [ ] إلغاء فاتورة مع تعديل المخزون
  - [ ] ربط منتج بمورد
  - [ ] تحديد مورد مفضل
  - [ ] عرض التقارير

---

## ✅ معايير الإنجاز

الميزة تعتبر مكتملة عندما:

1. ✅ كل الـ Tasks أعلاه مكتملة
2. ✅ كل الـ Tests تعمل بنجاح
3. ✅ الـ API Documentation محدثة
4. ✅ الاختبار اليدوي ناجح
5. ✅ Code Review مكتمل
6. ✅ لا توجد Bugs معروفة

---

## 📝 ملاحظات

- **Transaction Boundaries**: كل عملية تؤثر على المخزون أو المالية يجب أن تكون في Transaction
- **Audit Trail**: تسجيل كل العمليات في AuditLog
- **Multi-Tenancy**: التأكد من TenantId في كل مكان
- **Error Handling**: استخدام Error Codes الموحدة
- **Type Safety**: Frontend Types = Backend DTOs

---

**تاريخ الإنشاء**: 28 يناير 2026  
**الحالة**: جاهز للتنفيذ 🚀
