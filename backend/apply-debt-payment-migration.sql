-- Create DebtPayments table
CREATE TABLE IF NOT EXISTS "DebtPayments" (
    "Id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "TenantId" INTEGER NOT NULL,
    "BranchId" INTEGER NOT NULL,
    "CustomerId" INTEGER NOT NULL,
    "Amount" TEXT NOT NULL,
    "PaymentMethod" INTEGER NOT NULL,
    "ReferenceNumber" TEXT,
    "Notes" TEXT,
    "RecordedByUserId" INTEGER NOT NULL,
    "RecordedByUserName" TEXT,
    "ShiftId" INTEGER,
    "BalanceBefore" TEXT NOT NULL,
    "BalanceAfter" TEXT NOT NULL,
    "CreatedAt" TEXT NOT NULL,
    "UpdatedAt" TEXT,
    "IsDeleted" INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY ("TenantId") REFERENCES "Tenants" ("Id") ON DELETE RESTRICT,
    FOREIGN KEY ("BranchId") REFERENCES "Branches" ("Id") ON DELETE RESTRICT,
    FOREIGN KEY ("CustomerId") REFERENCES "Customers" ("Id") ON DELETE RESTRICT,
    FOREIGN KEY ("RecordedByUserId") REFERENCES "Users" ("Id") ON DELETE RESTRICT,
    FOREIGN KEY ("ShiftId") REFERENCES "Shifts" ("Id") ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "IX_DebtPayments_CustomerId_CreatedAt" ON "DebtPayments" ("CustomerId", "CreatedAt");
CREATE INDEX IF NOT EXISTS "IX_DebtPayments_TenantId_CreatedAt" ON "DebtPayments" ("TenantId", "CreatedAt");
CREATE INDEX IF NOT EXISTS "IX_DebtPayments_BranchId" ON "DebtPayments" ("BranchId");
CREATE INDEX IF NOT EXISTS "IX_DebtPayments_RecordedByUserId" ON "DebtPayments" ("RecordedByUserId");
CREATE INDEX IF NOT EXISTS "IX_DebtPayments_ShiftId" ON "DebtPayments" ("ShiftId");

-- Add migration history record
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260304030200_AddDebtPaymentEntity', '9.0.0');
