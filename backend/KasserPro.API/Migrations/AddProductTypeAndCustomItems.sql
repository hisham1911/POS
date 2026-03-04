-- =====================================================
-- Migration: Add ProductType and Custom POS Items Support
-- Date: 2026-03-01
-- Description: 
--   1. Add ProductType enum to Products table
--   2. Make OrderItem.ProductId nullable for custom items
--   3. Add custom item fields to OrderItem
--   4. Migrate existing data safely
-- =====================================================

BEGIN TRANSACTION;

-- =====================================================
-- PART 1: Add ProductType to Products
-- =====================================================

-- Add Type column (1 = Physical, 2 = Service)
ALTER TABLE Products ADD COLUMN Type INTEGER NOT NULL DEFAULT 1;

-- Migrate existing data:
-- - Products with TrackInventory = 1 → Type = Physical (1)
-- - Products with TrackInventory = 0 → Type = Service (2)
UPDATE Products 
SET Type = CASE 
    WHEN TrackInventory = 1 THEN 1  -- Physical
    WHEN TrackInventory = 0 THEN 2  -- Service
    ELSE 1  -- Default to Physical
END;

-- Create index for performance
CREATE INDEX IX_Products_Type ON Products(Type);

-- =====================================================
-- PART 2: Modify OrderItem for Custom Items
-- =====================================================

-- Step 1: Create new OrderItems table with updated schema
CREATE TABLE OrderItems_New (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Product reference (nullable for custom items)
    ProductId INTEGER NULL,
    
    -- Custom item support
    IsCustomItem INTEGER NOT NULL DEFAULT 0,
    CustomName TEXT NULL,
    CustomUnitPrice REAL NULL,
    CustomTaxRate REAL NULL,
    
    -- Product Snapshot
    ProductName TEXT NOT NULL,
    ProductNameEn TEXT NULL,
    ProductSku TEXT NULL,
    ProductBarcode TEXT NULL,
    
    -- Price Snapshot
    UnitPrice REAL NOT NULL,
    UnitCost REAL NULL,
    OriginalPrice REAL NOT NULL,
    
    Quantity INTEGER NOT NULL,
    
    -- Discount Snapshot
    DiscountType TEXT NULL,
    DiscountValue REAL NULL,
    DiscountAmount REAL NOT NULL DEFAULT 0,
    DiscountReason TEXT NULL,
    
    -- Tax Snapshot
    TaxRate REAL NOT NULL DEFAULT 14,
    TaxAmount REAL NOT NULL,
    TaxInclusive INTEGER NOT NULL DEFAULT 1,
    
    Subtotal REAL NOT NULL,
    Total REAL NOT NULL,
    Notes TEXT NULL,
    
    OrderId INTEGER NOT NULL,
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    UpdatedAt TEXT NULL,
    IsDeleted INTEGER NOT NULL DEFAULT 0,
    
    FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE RESTRICT
);

-- Step 2: Copy existing data
INSERT INTO OrderItems_New (
    Id, ProductId, IsCustomItem, CustomName, CustomUnitPrice, CustomTaxRate,
    ProductName, ProductNameEn, ProductSku, ProductBarcode,
    UnitPrice, UnitCost, OriginalPrice, Quantity,
    DiscountType, DiscountValue, DiscountAmount, DiscountReason,
    TaxRate, TaxAmount, TaxInclusive,
    Subtotal, Total, Notes,
    OrderId, CreatedAt, UpdatedAt, IsDeleted
)
SELECT 
    Id, 
    ProductId,  -- Keep existing ProductId (all existing items are catalog products)
    0 AS IsCustomItem,  -- All existing items are NOT custom
    NULL AS CustomName,
    NULL AS CustomUnitPrice,
    NULL AS CustomTaxRate,
    ProductName, ProductNameEn, ProductSku, ProductBarcode,
    UnitPrice, UnitCost, OriginalPrice, Quantity,
    DiscountType, DiscountValue, DiscountAmount, DiscountReason,
    TaxRate, TaxAmount, TaxInclusive,
    Subtotal, Total, Notes,
    OrderId, CreatedAt, UpdatedAt, IsDeleted
FROM OrderItems;

-- Step 3: Drop old table and rename new one
DROP TABLE OrderItems;
ALTER TABLE OrderItems_New RENAME TO OrderItems;

-- Step 4: Recreate indexes
CREATE INDEX IX_OrderItems_OrderId ON OrderItems(OrderId);
CREATE INDEX IX_OrderItems_ProductId ON OrderItems(ProductId) WHERE ProductId IS NOT NULL;
CREATE INDEX IX_OrderItems_IsCustomItem ON OrderItems(IsCustomItem);

-- =====================================================
-- PART 3: Data Validation
-- =====================================================

-- Verify all existing products have valid Type
SELECT 
    COUNT(*) as TotalProducts,
    SUM(CASE WHEN Type = 1 THEN 1 ELSE 0 END) as PhysicalProducts,
    SUM(CASE WHEN Type = 2 THEN 1 ELSE 0 END) as ServiceProducts
FROM Products;

-- Verify all existing order items are properly migrated
SELECT 
    COUNT(*) as TotalOrderItems,
    SUM(CASE WHEN IsCustomItem = 0 THEN 1 ELSE 0 END) as CatalogItems,
    SUM(CASE WHEN IsCustomItem = 1 THEN 1 ELSE 0 END) as CustomItems,
    SUM(CASE WHEN ProductId IS NULL THEN 1 ELSE 0 END) as ItemsWithoutProduct
FROM OrderItems;

-- =====================================================
-- PART 4: Update Application Version
-- =====================================================

-- Record migration in a metadata table (if exists)
-- INSERT INTO MigrationHistory (Version, Description, AppliedAt)
-- VALUES ('2026.03.01.001', 'Add ProductType and Custom POS Items Support', datetime('now'));

COMMIT;

-- =====================================================
-- ROLLBACK SCRIPT (Keep for reference, do not execute)
-- =====================================================
/*
BEGIN TRANSACTION;

-- Restore OrderItems to old schema
CREATE TABLE OrderItems_Old (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    ProductId INTEGER NOT NULL,
    ProductName TEXT NOT NULL,
    ProductNameEn TEXT NULL,
    ProductSku TEXT NULL,
    ProductBarcode TEXT NULL,
    UnitPrice REAL NOT NULL,
    UnitCost REAL NULL,
    OriginalPrice REAL NOT NULL,
    Quantity INTEGER NOT NULL,
    DiscountType TEXT NULL,
    DiscountValue REAL NULL,
    DiscountAmount REAL NOT NULL DEFAULT 0,
    DiscountReason TEXT NULL,
    TaxRate REAL NOT NULL DEFAULT 14,
    TaxAmount REAL NOT NULL,
    TaxInclusive INTEGER NOT NULL DEFAULT 1,
    Subtotal REAL NOT NULL,
    Total REAL NOT NULL,
    Notes TEXT NULL,
    OrderId INTEGER NOT NULL,
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    UpdatedAt TEXT NULL,
    IsDeleted INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
    FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE RESTRICT
);

-- Copy back only non-custom items
INSERT INTO OrderItems_Old SELECT 
    Id, ProductId, ProductName, ProductNameEn, ProductSku, ProductBarcode,
    UnitPrice, UnitCost, OriginalPrice, Quantity,
    DiscountType, DiscountValue, DiscountAmount, DiscountReason,
    TaxRate, TaxAmount, TaxInclusive,
    Subtotal, Total, Notes,
    OrderId, CreatedAt, UpdatedAt, IsDeleted
FROM OrderItems
WHERE IsCustomItem = 0 AND ProductId IS NOT NULL;

DROP TABLE OrderItems;
ALTER TABLE OrderItems_Old RENAME TO OrderItems;

-- Remove Type column from Products
-- Note: SQLite doesn't support DROP COLUMN directly
-- Would need to recreate table without Type column

COMMIT;
*/
