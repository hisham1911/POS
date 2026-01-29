# التصميم التقني: المصروفات والخزينة

## نظرة عامة

هذا المستند يحتوي على التصميم التقني التفصيلي لميزتي المصروفات والخزينة.

**المعمارية**: Clean Architecture + Multi-Tenancy + Tax Exclusive Model

---

## جدول المحتويات

1. [Database Schema](#1-database-schema)
2. [Domain Layer](#2-domain-layer)
3. [Application Layer](#3-application-layer)
4. [API Layer](#4-api-layer)
5. [Frontend](#5-frontend)
6. [Business Rules](#6-business-rules)
7. [Integration Points](#7-integration-points)

---

## 1. Database Schema

### 1.1 New Tables

#### ExpenseCategory
```sql
CREATE TABLE ExpenseCategories (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    TenantId INTEGER NOT NULL,
    Name TEXT NOT NULL,
    NameEn TEXT,
    Description TEXT,
    Icon TEXT,
    Color TEXT,
    IsActive BOOLEAN NOT NULL DEFAULT 1,
    IsSystem BOOLEAN NOT NULL DEFAULT 0,
    SortOrder INTEGER NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NOT NULL,
    IsDeleted BOOLEAN NOT NULL DEFAULT 0
);
```

#### Expense
```sql
CREATE TABLE Expenses (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    TenantId INTEGER NOT NULL,
    BranchId INTEGER NOT NULL,
    ExpenseNumber TEXT NOT NULL,
    CategoryId INTEGER NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    ExpenseDate DATETIME NOT NULL,
    Description TEXT NOT NULL,
    Beneficiary TEXT,
    ReferenceNumber TEXT,
    Notes TEXT,
    Status TEXT NOT NULL, -- Draft, Approved, Paid, Rejected
    ShiftId INTEGER,
    PaymentMethod TEXT, -- Cash, Card, BankTransfer
    PaymentDate DATETIME,
    PaymentReferenceNumber TEXT,
    CreatedByUserId INTEGER NOT NULL,
    CreatedByUserName TEXT NOT NULL,
    ApprovedByUserId INTEGER,
    ApprovedByUserName TEXT,
    ApprovedAt DATETIME,
    PaidByUserId INTEGER,
    PaidByUserName TEXT,
    PaidAt DATETIME,
    RejectedByUserId INTEGER,
    RejectedByUserName TEXT,
    RejectedAt DATETIME,
    RejectionReason TEXT,
    CreatedAt DATETIME NOT NULL,
    UpdatedAt DATETIME NOT NULL,
    IsDeleted BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (CategoryId) REFERENCES ExpenseCategories(Id),
    FOREIGN KEY (ShiftId) REFERENCES Shifts(Id)
);
```

#### ExpenseAttachment
```sql
CREATE TABLE ExpenseAttachments (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    ExpenseId INTEGER NOT NULL,
    FileName TEXT NOT NULL,
    FilePath TEXT NOT NULL,
    FileSize INTEGER NOT NULL,
    FileType TEXT NOT NULL,
    UploadedByUserId INTEGER NOT NULL,
    UploadedByUserName TEXT NOT NULL,
    CreatedAt DATETIME NOT NULL,
    IsDeleted BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (ExpenseId) REFERENCES Expenses(Id) ON DELETE CASCADE
);
```

#### CashRegisterTransaction
```sql
CREATE TABLE CashRegisterTransactions (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    TenantId INTEGER NOT NULL,
    BranchId INTEGER NOT NULL,
    TransactionNumber TEXT NOT NULL,
    Type TEXT NOT NULL, -- Opening, Deposit, Withdrawal, Sale, Refund, Expense, SupplierPayment, Adjustment, Transfer
    Amount DECIMAL(18,2) NOT NULL,
    BalanceBefore DECIMAL(18,2) NOT NULL,
    BalanceAfter DECIMAL(18,2) NOT NULL,
    TransactionDate DATETIME NOT NULL,
    Description TEXT NOT NULL,
    ReferenceType TEXT, -- Order, Expense, PurchaseInvoice, Shift
    ReferenceId INTEGER,
    ShiftId INTEGER,
    TransferReferenceId INTEGER, -- For linking transfer transactions
    UserId INTEGER NOT NULL,
    UserName TEXT NOT NULL,
    CreatedAt DATETIME NOT NULL,
    IsDeleted BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (ShiftId) REFERENCES Shifts(Id)
);
```

### 1.2 Modified Tables

#### Shift (Add Cash Register fields)
```sql
-- الحقول الموجودة بالفعل:
-- OpeningBalance, ClosingBalance, ExpectedBalance, Difference

-- الحقول المطلوب إضافتها فقط:
ALTER TABLE Shifts ADD COLUMN IsReconciled BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE Shifts ADD COLUMN ReconciledByUserId INTEGER;
ALTER TABLE Shifts ADD COLUMN ReconciledByUserName TEXT;
ALTER TABLE Shifts ADD COLUMN ReconciledAt DATETIME;
ALTER TABLE Shifts ADD COLUMN VarianceReason TEXT;
```

**ملاحظة**: نستخدم الحقول الموجودة:
- `OpeningBalance` = Opening cash balance
- `ClosingBalance` = Closing cash balance  
- `ExpectedBalance` = Expected cash balance
- `Difference` = Cash variance

### 1.3 Indexes
```sql
CREATE INDEX IX_Expenses_TenantId_BranchId ON Expenses(TenantId, BranchId);
CREATE INDEX IX_Expenses_Status ON Expenses(Status);
CREATE INDEX IX_Expenses_ExpenseDate ON Expenses(ExpenseDate);
CREATE INDEX IX_Expenses_CategoryId ON Expenses(CategoryId);
CREATE INDEX IX_Expenses_ShiftId ON Expenses(ShiftId);

CREATE INDEX IX_CashRegisterTransactions_TenantId_BranchId ON CashRegisterTransactions(TenantId, BranchId);
CREATE INDEX IX_CashRegisterTransactions_Type ON CashRegisterTransactions(Type);
CREATE INDEX IX_CashRegisterTransactions_TransactionDate ON CashRegisterTransactions(TransactionDate);
CREATE INDEX IX_CashRegisterTransactions_ShiftId ON CashRegisterTransactions(ShiftId);
CREATE INDEX IX_CashRegisterTransactions_ReferenceType_ReferenceId ON CashRegisterTransactions(ReferenceType, ReferenceId);
```

---

## 2. Domain Layer

### 2.1 Entities


#### ExpenseCategory Entity
- Properties: Id, TenantId, Name, NameEn, Description, Icon, Color, IsActive, IsSystem, SortOrder
- Navigation: Expenses (ICollection<Expense>)

#### Expense Entity  
- Properties: Id, TenantId, BranchId, ExpenseNumber, CategoryId, Amount, ExpenseDate, Description, Beneficiary, ReferenceNumber, Notes, Status, ShiftId, PaymentMethod, PaymentDate, PaymentReferenceNumber, CreatedByUserId, CreatedByUserName, ApprovedByUserId, ApprovedByUserName, ApprovedAt, PaidByUserId, PaidByUserName, PaidAt, RejectedByUserId, RejectedByUserName, RejectedAt, RejectionReason
- Navigation: Category, Shift, Attachments (ICollection<ExpenseAttachment>)

#### ExpenseAttachment Entity
- Properties: Id, ExpenseId, FileName, FilePath, FileSize, FileType, UploadedByUserId, UploadedByUserName
- Navigation: Expense

#### CashRegisterTransaction Entity
- Properties: Id, TenantId, BranchId, TransactionNumber, Type, Amount, BalanceBefore, BalanceAfter, TransactionDate, Description, ReferenceType, ReferenceId, ShiftId, TransferReferenceId, UserId, UserName
- Navigation: Shift

### 2.2 Enums

#### ExpenseStatus
- Draft = 0
- Approved = 1
- Paid = 2
- Rejected = 3

#### CashRegisterTransactionType
- Opening = 0
- Deposit = 1
- Withdrawal = 2
- Sale = 3
- Refund = 4
- Expense = 5
- SupplierPayment = 6
- Adjustment = 7
- Transfer = 8

#### PaymentMethod (تحديث - إضافة BankTransfer)
- Cash = 0
- Card = 1
- Fawry = 2
- BankTransfer = 3 (جديد)

---

## 3. Application Layer

### 3.1 DTOs

**Request DTOs:**
- CreateExpenseRequest
- UpdateExpenseRequest
- ApproveExpenseRequest
- RejectExpenseRequest
- PayExpenseRequest
- CreateExpenseCategoryRequest
- UpdateExpenseCategoryRequest
- CreateCashRegisterTransactionRequest
- ReconcileCashRegisterRequest
- TransferCashRequest

**Response DTOs:**
- ExpenseDto
- ExpenseCategoryDto
- ExpenseAttachmentDto
- CashRegisterTransactionDto
- CashRegisterBalanceDto
- CashRegisterSummaryDto

### 3.2 Services

#### IExpenseService
- GetAllAsync(filters, pagination)
- GetByIdAsync(id)
- CreateAsync(request)
- UpdateAsync(id, request)
- DeleteAsync(id)
- ApproveAsync(id, request)
- RejectAsync(id, request)
- PayAsync(id, request)
- GetExpenseReportAsync(filters)

#### IExpenseCategoryService
- GetAllAsync()
- GetByIdAsync(id)
- CreateAsync(request)
- UpdateAsync(id, request)
- DeleteAsync(id)

#### ICashRegisterService
- GetCurrentBalanceAsync(branchId)
- GetTransactionsAsync(filters, pagination)
- CreateTransactionAsync(request)
- ReconcileAsync(shiftId, request)
- TransferCashAsync(request)
- GetCashRegisterHistoryAsync(filters)
- GetCashRegisterSummaryAsync(branchId, dateRange)

---

## 4. API Layer

### 4.1 Expenses Endpoints

```
GET    /api/expenses
GET    /api/expenses/{id}
POST   /api/expenses
PUT    /api/expenses/{id}
DELETE /api/expenses/{id}
POST   /api/expenses/{id}/approve
POST   /api/expenses/{id}/reject
POST   /api/expenses/{id}/pay
POST   /api/expenses/{id}/attachments
DELETE /api/expenses/{id}/attachments/{attachmentId}
GET    /api/expenses/report
```

### 4.2 Expense Categories Endpoints

```
GET    /api/expense-categories
GET    /api/expense-categories/{id}
POST   /api/expense-categories
PUT    /api/expense-categories/{id}
DELETE /api/expense-categories/{id}
```

### 4.3 Cash Register Endpoints

```
GET    /api/cash-register/balance
GET    /api/cash-register/transactions
POST   /api/cash-register/deposit
POST   /api/cash-register/withdraw
POST   /api/cash-register/reconcile
POST   /api/cash-register/transfer
GET    /api/cash-register/history
GET    /api/cash-register/summary
```

---

## 5. Frontend

### 5.1 Pages

- ExpensesPage: List all expenses with filters
- ExpenseFormPage: Create/Edit expense
- ExpenseDetailsPage: View expense details
- ExpenseCategoriesPage: Manage categories
- CashRegisterDashboard: Overview of cash register
- CashRegisterTransactionsPage: List all transactions
- CashRegisterReportsPage: Reports and analytics

### 5.2 Components

- ExpenseCard
- ExpenseFormModal
- ApproveExpenseModal
- RejectExpenseModal
- PayExpenseModal
- AttachmentUploader
- CashRegisterBalance
- CashRegisterTransactionList
- ReconcileModal
- TransferCashModal
- DepositWithdrawModal

### 5.3 Routes

```
/expenses
/expenses/new
/expenses/:id
/expenses/:id/edit
/expense-categories
/cash-register
/cash-register/transactions
/cash-register/reports
```

---

## 6. Business Rules

### 6.1 Expense State Transitions

```
Draft → Approved (Admin only)
Draft → Rejected (Admin only)
Approved → Paid (Admin only, requires payment method)
```

### 6.2 Cash Register Rules

1. Balance cannot go negative (configurable)
2. All cash transactions must update register
3. Reconciliation required before shift close
4. Transfer requires sufficient balance in source branch
5. Adjustment transactions for variance correction

### 6.3 Integration Rules

1. Cash order payment → Create Sale transaction
2. Cash order refund → Create Refund transaction
3. Cash expense payment → Create Expense transaction
4. Cash supplier payment → Create SupplierPayment transaction
5. Shift open → Create Opening transaction
6. Shift close → Reconciliation required

---

## 7. Integration Points

### 7.1 Shifts Integration

- Add cash register fields to Shift entity
- Opening balance on shift start
- Reconciliation on shift close
- Link expenses to shifts

### 7.2 Orders Integration

- Cash payments update register automatically
- Create Sale transaction
- Link transaction to order

### 7.3 Purchase Invoices Integration

- Cash payments update register automatically
- Create SupplierPayment transaction
- Link transaction to invoice

---

**تاريخ الإنشاء**: 29 يناير 2026  
**الحالة**: ✅ جاهز للتنفيذ
