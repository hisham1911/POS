CREATE TABLE "Tenants" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Tenants" PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "NameEn" TEXT NULL,
    "Slug" TEXT NOT NULL,
    "LogoUrl" TEXT NULL,
    "Currency" TEXT NOT NULL DEFAULT 'EGP',
    "Timezone" TEXT NOT NULL DEFAULT 'Africa/Cairo',
    "IsActive" INTEGER NOT NULL,
    "TaxRate" TEXT NOT NULL DEFAULT '14.0',
    "IsTaxEnabled" INTEGER NOT NULL DEFAULT 1,
    "CreatedAt" TEXT NOT NULL,
    "UpdatedAt" TEXT NULL,
    "IsDeleted" INTEGER NOT NULL
);


CREATE TABLE "Branches" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Branches" PRIMARY KEY AUTOINCREMENT,
    "TenantId" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Code" TEXT NOT NULL,
    "Address" TEXT NULL,
    "Phone" TEXT NULL,
    "DefaultTaxRate" TEXT NOT NULL,
    "DefaultTaxInclusive" INTEGER NOT NULL,
    "CurrencyCode" TEXT NOT NULL,
    "IsActive" INTEGER NOT NULL,
    "CreatedAt" TEXT NOT NULL,
    "UpdatedAt" TEXT NULL,
    "IsDeleted" INTEGER NOT NULL,
    CONSTRAINT "FK_Branches_Tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES "Tenants" ("Id") ON DELETE RESTRICT
);


CREATE TABLE "Categories" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Categories" PRIMARY KEY AUTOINCREMENT,
    "TenantId" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "NameEn" TEXT NULL,
    "Description" TEXT NULL,
    "ImageUrl" TEXT NULL,
    "SortOrder" INTEGER NOT NULL,
    "IsActive" INTEGER NOT NULL,
    "CreatedAt" TEXT NOT NULL,
    "UpdatedAt" TEXT NULL,
    "IsDeleted" INTEGER NOT NULL,
    CONSTRAINT "FK_Categories_Tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES "Tenants" ("Id") ON DELETE RESTRICT
);


CREATE TABLE "Users" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Users" PRIMARY KEY AUTOINCREMENT,
    "TenantId" INTEGER NOT NULL,
    "BranchId" INTEGER NULL,
    "Name" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "PasswordHash" TEXT NOT NULL,
    "Phone" TEXT NULL,
    "Role" INTEGER NOT NULL,
    "IsActive" INTEGER NOT NULL,
    "PinCode" TEXT NULL,
    "CreatedAt" TEXT NOT NULL,
    "UpdatedAt" TEXT NULL,
    "IsDeleted" INTEGER NOT NULL,
    CONSTRAINT "FK_Users_Branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES "Branches" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Users_Tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES "Tenants" ("Id") ON DELETE RESTRICT
);


CREATE TABLE "Products" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Products" PRIMARY KEY AUTOINCREMENT,
    "TenantId" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "NameEn" TEXT NULL,
    "Description" TEXT NULL,
    "Sku" TEXT NULL,
    "Barcode" TEXT NULL,
    "Price" TEXT NOT NULL,
    "Cost" TEXT NULL,
    "TaxRate" TEXT NULL,
    "TaxInclusive" INTEGER NOT NULL,
    "ImageUrl" TEXT NULL,
    "IsActive" INTEGER NOT NULL,
    "TrackInventory" INTEGER NOT NULL,
    "StockQuantity" INTEGER NULL,
    "CategoryId" INTEGER NOT NULL,
    "CreatedAt" TEXT NOT NULL,
    "UpdatedAt" TEXT NULL,
    "IsDeleted" INTEGER NOT NULL,
    CONSTRAINT "FK_Products_Categories_CategoryId" FOREIGN KEY ("CategoryId") REFERENCES "Categories" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Products_Tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES "Tenants" ("Id") ON DELETE RESTRICT
);


CREATE TABLE "AuditLogs" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_AuditLogs" PRIMARY KEY AUTOINCREMENT,
    "TenantId" INTEGER NOT NULL,
    "BranchId" INTEGER NULL,
    "UserId" INTEGER NULL,
    "UserName" TEXT NULL,
    "Action" TEXT NOT NULL,
    "EntityType" TEXT NOT NULL,
    "EntityId" INTEGER NULL,
    "OldValues" TEXT NULL,
    "NewValues" TEXT NULL,
    "IpAddress" TEXT NULL,
    "CreatedAt" TEXT NOT NULL,
    "UpdatedAt" TEXT NULL,
    "IsDeleted" INTEGER NOT NULL,
    CONSTRAINT "FK_AuditLogs_Branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES "Branches" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_AuditLogs_Tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES "Tenants" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_AuditLogs_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
);


CREATE TABLE "Shifts" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Shifts" PRIMARY KEY AUTOINCREMENT,
    "TenantId" INTEGER NOT NULL,
    "BranchId" INTEGER NOT NULL,
    "OpeningBalance" TEXT NOT NULL,
    "ClosingBalance" TEXT NOT NULL,
    "ExpectedBalance" TEXT NOT NULL,
    "Difference" TEXT NOT NULL,
    "OpenedAt" TEXT NOT NULL,
    "ClosedAt" TEXT NULL,
    "IsClosed" INTEGER NOT NULL,
    "Notes" TEXT NULL,
    "TotalCash" TEXT NOT NULL,
    "TotalCard" TEXT NOT NULL,
    "TotalOrders" INTEGER NOT NULL,
    "UserId" INTEGER NOT NULL,
    "RowVersion" BLOB NOT NULL DEFAULT X'',
    "CreatedAt" TEXT NOT NULL,
    "UpdatedAt" TEXT NULL,
    "IsDeleted" INTEGER NOT NULL,
    CONSTRAINT "FK_Shifts_Branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES "Branches" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Shifts_Tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES "Tenants" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Shifts_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);


CREATE TABLE "Orders" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Orders" PRIMARY KEY AUTOINCREMENT,
    "TenantId" INTEGER NOT NULL,
    "BranchId" INTEGER NOT NULL,
    "BranchName" TEXT NULL,
    "BranchAddress" TEXT NULL,
    "BranchPhone" TEXT NULL,
    "OrderNumber" TEXT NOT NULL,
    "Status" INTEGER NOT NULL,
    "OrderType" INTEGER NOT NULL,
    "CurrencyCode" TEXT NOT NULL,
    "Subtotal" TEXT NOT NULL,
    "DiscountType" TEXT NULL,
    "DiscountValue" TEXT NULL,
    "DiscountAmount" TEXT NOT NULL,
    "DiscountCode" TEXT NULL,
    "DiscountId" INTEGER NULL,
    "TaxRate" TEXT NOT NULL,
    "TaxAmount" TEXT NOT NULL,
    "ServiceChargePercent" TEXT NOT NULL,
    "ServiceChargeAmount" TEXT NOT NULL,
    "Total" TEXT NOT NULL,
    "AmountPaid" TEXT NOT NULL,
    "AmountDue" TEXT NOT NULL,
    "ChangeAmount" TEXT NOT NULL,
    "CustomerName" TEXT NULL,
    "CustomerPhone" TEXT NULL,
    "CustomerId" INTEGER NULL,
    "Notes" TEXT NULL,
    "CompletedAt" TEXT NULL,
    "CancelledAt" TEXT NULL,
    "CancellationReason" TEXT NULL,
    "UserId" INTEGER NOT NULL,
    "UserName" TEXT NULL,
    "ShiftId" INTEGER NULL,
    "CompletedByUserId" INTEGER NULL,
    "CreatedAt" TEXT NOT NULL,
    "UpdatedAt" TEXT NULL,
    "IsDeleted" INTEGER NOT NULL,
    CONSTRAINT "FK_Orders_Branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES "Branches" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Orders_Shifts_ShiftId" FOREIGN KEY ("ShiftId") REFERENCES "Shifts" ("Id"),
    CONSTRAINT "FK_Orders_Tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES "Tenants" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Orders_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
);


CREATE TABLE "OrderItems" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_OrderItems" PRIMARY KEY AUTOINCREMENT,
    "ProductId" INTEGER NOT NULL,
    "ProductName" TEXT NOT NULL,
    "ProductNameEn" TEXT NULL,
    "ProductSku" TEXT NULL,
    "ProductBarcode" TEXT NULL,
    "UnitPrice" TEXT NOT NULL,
    "UnitCost" TEXT NULL,
    "OriginalPrice" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "DiscountType" TEXT NULL,
    "DiscountValue" TEXT NULL,
    "DiscountAmount" TEXT NOT NULL,
    "DiscountReason" TEXT NULL,
    "TaxRate" TEXT NOT NULL,
    "TaxAmount" TEXT NOT NULL,
    "TaxInclusive" INTEGER NOT NULL,
    "Subtotal" TEXT NOT NULL,
    "Total" TEXT NOT NULL,
    "Notes" TEXT NULL,
    "OrderId" INTEGER NOT NULL,
    "CreatedAt" TEXT NOT NULL,
    "UpdatedAt" TEXT NULL,
    "IsDeleted" INTEGER NOT NULL,
    CONSTRAINT "FK_OrderItems_Orders_OrderId" FOREIGN KEY ("OrderId") REFERENCES "Orders" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_OrderItems_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products" ("Id") ON DELETE CASCADE
);


CREATE TABLE "Payments" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Payments" PRIMARY KEY AUTOINCREMENT,
    "TenantId" INTEGER NOT NULL,
    "BranchId" INTEGER NOT NULL,
    "Method" INTEGER NOT NULL,
    "Amount" TEXT NOT NULL,
    "Reference" TEXT NULL,
    "OrderId" INTEGER NOT NULL,
    "CreatedAt" TEXT NOT NULL,
    "UpdatedAt" TEXT NULL,
    "IsDeleted" INTEGER NOT NULL,
    CONSTRAINT "FK_Payments_Branches_BranchId" FOREIGN KEY ("BranchId") REFERENCES "Branches" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Payments_Orders_OrderId" FOREIGN KEY ("OrderId") REFERENCES "Orders" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Payments_Tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES "Tenants" ("Id") ON DELETE RESTRICT
);


CREATE INDEX "IX_AuditLogs_BranchId" ON "AuditLogs" ("BranchId");


CREATE INDEX "IX_AuditLogs_EntityType_EntityId" ON "AuditLogs" ("EntityType", "EntityId");


CREATE INDEX "IX_AuditLogs_TenantId_CreatedAt" ON "AuditLogs" ("TenantId", "CreatedAt");


CREATE INDEX "IX_AuditLogs_UserId" ON "AuditLogs" ("UserId");


CREATE UNIQUE INDEX "IX_Branches_TenantId_Code" ON "Branches" ("TenantId", "Code");


CREATE INDEX "IX_Categories_TenantId" ON "Categories" ("TenantId");


CREATE INDEX "IX_OrderItems_OrderId" ON "OrderItems" ("OrderId");


CREATE INDEX "IX_OrderItems_ProductId" ON "OrderItems" ("ProductId");


CREATE INDEX "IX_Orders_BranchId" ON "Orders" ("BranchId");


CREATE UNIQUE INDEX "IX_Orders_OrderNumber" ON "Orders" ("OrderNumber");


CREATE INDEX "IX_Orders_ShiftId" ON "Orders" ("ShiftId");


CREATE INDEX "IX_Orders_TenantId" ON "Orders" ("TenantId");


CREATE INDEX "IX_Orders_UserId" ON "Orders" ("UserId");


CREATE INDEX "IX_Payments_BranchId" ON "Payments" ("BranchId");


CREATE INDEX "IX_Payments_OrderId" ON "Payments" ("OrderId");


CREATE INDEX "IX_Payments_TenantId" ON "Payments" ("TenantId");


CREATE INDEX "IX_Products_CategoryId" ON "Products" ("CategoryId");


CREATE INDEX "IX_Products_TenantId" ON "Products" ("TenantId");


CREATE INDEX "IX_Shifts_BranchId" ON "Shifts" ("BranchId");


CREATE INDEX "IX_Shifts_TenantId" ON "Shifts" ("TenantId");


CREATE INDEX "IX_Shifts_UserId" ON "Shifts" ("UserId");


CREATE UNIQUE INDEX "IX_Tenants_Slug" ON "Tenants" ("Slug");


CREATE INDEX "IX_Users_BranchId" ON "Users" ("BranchId");


CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");


CREATE INDEX "IX_Users_TenantId" ON "Users" ("TenantId");


