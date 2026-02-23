---
inclusion: auto
fileMatchPattern: "**/*.cs"
---

# 🔄 Database Migrations & Schema Changes Guide

## 📋 Overview

This guide provides critical rules for safely evolving the KasserPro database schema after production deployment. Following these rules prevents data loss and ensures smooth backup/restore operations.

---

## 🏗️ Current System Architecture

### Backup/Restore Flow

```
🔹 Application Startup:
1. Check for pending migrations
2. If migrations exist → Create pre-migration backup
3. If backup fails → STOP application (safety first)
4. Apply migrations via MigrateAsync()

🔹 Restore Operation:
1. Validate backup file integrity (PRAGMA integrity_check)
2. Enable Maintenance Mode (blocks all API requests)
3. Create pre-restore backup (safety net)
4. Clear SQLite connection pools
5. Delete WAL/SHM files
6. Copy backup file over current database
7. Apply pending migrations to restored database
8. Run DataValidationService
9. Disable Maintenance Mode
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `BackupService` | Creates hot backups using SQLite Backup API |
| `RestoreService` | Handles database restoration with safety checks |
| `DataValidationService` | Validates data integrity after restore |
| `MaintenanceModeMiddleware` | Blocks requests during critical operations |
| `DailyBackupBackgroundService` | Automated daily backups at 2 AM |

---

## 🚨 Critical Rules for Schema Changes

### Golden Rule

> **NEVER modify existing columns — ADD new columns and migrate data**

### SQLite-Specific Considerations

1. **Type Affinity, Not Type Enforcement**
   - SQLite uses "type affinity" — columns can store any type
   - `decimal` in EF Core → stored as `TEXT` in SQLite
   - EF Core handles TEXT ↔ decimal conversion automatically

2. **Limited ALTER TABLE Support**
   - SQLite does NOT support `ALTER COLUMN`
   - Changing column types requires: Create new table → Copy data → Drop old → Rename

3. **EF Core Migrations with SQLite**
   - `AlterColumn` operations trigger table recreation
   - This is risky with production data
   - Always use Add + Migrate + Drop pattern instead

---

## ✅ Safe Schema Change Patterns

### 1. Adding a New Column (100% Safe)

```bash
dotnet ef migrations add AddNewColumn
```

```csharp
// Migration code
migrationBuilder.AddColumn<string>(
    name: "NewColumn",
    table: "Products",
    type: "TEXT",
    nullable: false,
    defaultValue: "");
```

**Why it's safe:**
- Old backups restored → migration adds the column automatically
- No data loss risk
- No type conversion issues

---

### 2. Changing Column Type (DANGEROUS - Use 3-Step Pattern)

**❌ NEVER do this:**

```csharp
// This triggers table recreation in SQLite!
migrationBuilder.AlterColumn<decimal>(
    name: "Price",
    table: "Products",
    type: "TEXT",
    nullable: false);
```

**✅ CORRECT 3-Step Pattern:**

```csharp
// Step 1: Add new column with correct type
migrationBuilder.AddColumn<decimal>(
    name: "PriceNew",
    table: "Products",
    type: "TEXT",
    precision: 18,
    scale: 2,
    nullable: false,
    defaultValue: 0m);

// Step 2: Migrate data
migrationBuilder.Sql(@"
    UPDATE Products 
    SET PriceNew = CAST(Price AS REAL)
    WHERE Price IS NOT NULL;
");

// Step 3: Drop old column and rename new one
migrationBuilder.DropColumn("Price", "Products");
migrationBuilder.RenameColumn("PriceNew", "Products", newName: "Price");
```

**Best Practice:** Split into 3 separate migrations:
1. Migration 1: Add new column + migrate data
2. Deploy and test
3. Migration 2: Drop old column (after confirming data is correct)

---

### 3. Deleting a Column (MEDIUM RISK)

**Never delete columns with important data without migration:**

```csharp
// Step 1: (Separate migration) - Add new column and copy data
migrationBuilder.AddColumn<string>(
    name: "PhoneNew",
    table: "Customers",
    type: "TEXT",
    nullable: true);

migrationBuilder.Sql(@"
    UPDATE Customers 
    SET PhoneNew = Phone;
");

// Step 2: (Separate migration after testing) - Drop old column
migrationBuilder.DropColumn("Phone", "Customers");
```

---

### 4. Renaming a Column (DANGEROUS in SQLite)

```csharp
// ❌ Not directly supported in SQLite
migrationBuilder.RenameColumn("OldName", "Products", newName: "NewName");

// ✅ Use Add + Copy + Drop pattern (same as changing type)
```

---

### 5. Adding Foreign Key Constraint

```csharp
// ⚠️ Ensure existing data satisfies the constraint first!
migrationBuilder.Sql(@"
    DELETE FROM OrderItems 
    WHERE ProductId NOT IN (SELECT Id FROM Products);
");

migrationBuilder.AddForeignKey(
    name: "FK_OrderItems_Products",
    table: "OrderItems",
    column: "ProductId",
    principalTable: "Products",
    principalColumn: "Id",
    onDelete: ReferentialAction.Cascade);
```

---

## 📊 Risk Assessment Table

| Change Type | Risk Level | Safe Pattern |
|-------------|-----------|--------------|
| Add new table | ✅ Safe | `CreateTable` |
| Add new column | ✅ Safe | `AddColumn` with default value |
| Drop table | ⚠️ Medium | Ensure no FK references |
| Drop column | ⚠️ Medium | Migrate data first |
| Change column type | 🔴 High | Add + Migrate + Drop (3 steps) |
| Rename column | 🔴 High | Add + Copy + Drop |
| Change nullable → required | ⚠️ Medium | Add default value in migration |
| Change required → nullable | ✅ Safe | `AlterColumn` (SQLite may recreate) |
| Add index | ✅ Safe | `CreateIndex` |
| Add foreign key | ⚠️ Medium | Validate existing data first |

---

## 🧪 Pre-Release Testing Checklist

Before deploying any schema changes:

| Step | Action |
|------|--------|
| 1 | Create backup of current production database |
| 2 | Apply migrations to test copy |
| 3 | Run application and verify functionality |
| 4 | **Test restore of OLD backup on NEW version** |
| 5 | Verify migrations apply successfully after restore |
| 6 | Run integration tests |
| 7 | If all pass → Deploy |

---

## 🔍 Migration Code Review Checklist

Before committing a migration, verify:

```bash
# After creating migration:
dotnet ef migrations add YourMigrationName

# Open the generated migration file and check:
```

- [ ] No `AlterColumn` operations (use Add + Migrate + Drop instead)
- [ ] No `DropColumn` without data migration
- [ ] No `RenameColumn` (use Add + Copy + Drop)
- [ ] All new columns have appropriate default values
- [ ] Foreign keys validated with SQL check
- [ ] Data migration SQL tested on copy of production data

---

## 🛡️ Backup Strategy

### Automatic Backups

1. **Pre-Migration Backup** (on startup if migrations pending)
   - Filename: `kasserpro-backup-YYYYMMDD-HHmmss-pre-migration.db`
   - Retention: Indefinite (never auto-deleted)

2. **Pre-Restore Backup** (before restore operation)
   - Filename: `kasserpro-backup-YYYYMMDD-HHmmss-pre-restore.db`
   - Retention: 14 days

3. **Daily Scheduled Backup** (2 AM UTC)
   - Filename: `kasserpro-backup-YYYYMMDD-HHmmss-daily-scheduled.db`
   - Retention: 14 days

4. **Manual Backup**
   - Filename: `kasserpro-backup-YYYYMMDD-HHmmss.db`
   - Retention: 14 days

### Backup Integrity

All backups undergo `PRAGMA integrity_check` immediately after creation. Corrupt backups are automatically deleted.

---

## 🚀 Deployment Workflow

### Standard Deployment (No Schema Changes)

```bash
# 1. Build and test
dotnet build
dotnet test

# 2. Deploy
# Application will start normally (no pending migrations)
```

### Deployment with Schema Changes

```bash
# 1. Review migration code
cat Migrations/YYYYMMDD_MigrationName.cs

# 2. Test on staging with production data copy
dotnet ef database update

# 3. Test restore of old backup
# (Use admin panel: Backup → Restore → Select old backup)

# 4. If successful, deploy to production
# Application will:
#   - Detect pending migrations
#   - Create pre-migration backup
#   - Apply migrations
#   - Start normally
```

---

## 🔧 Troubleshooting

### Migration Failed During Startup

```bash
# Check logs
tail -f backend/KasserPro.API/logs/kasserpro-YYYYMMDD.log

# Application will NOT start if migration fails (by design)
# Pre-migration backup is available in backups/ folder
```

### Restore Failed

```bash
# Check if maintenance mode is stuck
ls maintenance.lock

# If exists, manually disable:
rm maintenance.lock

# Check logs for specific error
tail -f backend/KasserPro.API/logs/kasserpro-YYYYMMDD.log

# Pre-restore backup is available if needed
```

### Data Validation Issues After Restore

```bash
# DataValidationService checks:
# 1. Products.Price is numeric
# 2. Products.StockQuantity is numeric
# 3. Orders.Total is numeric

# Issues are logged but don't block restore
# Review logs and fix data manually if needed
```

---

## 📝 Example: Safe Column Type Change

**Scenario:** Change `Product.Price` from `decimal(18,2)` to `decimal(18,4)`

```csharp
// ❌ WRONG - Don't do this
public class UpdatePricePrecision : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<decimal>(
            name: "Price",
            table: "Products",
            type: "TEXT",
            precision: 18,
            scale: 4,  // Changed from 2 to 4
            nullable: false);
    }
}
```

```csharp
// ✅ CORRECT - 3-Step Pattern
// Migration 1: Add new column
public class AddPriceNewColumn : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<decimal>(
            name: "PriceNew",
            table: "Products",
            type: "TEXT",
            precision: 18,
            scale: 4,
            nullable: false,
            defaultValue: 0m);
        
        // Copy data
        migrationBuilder.Sql(@"
            UPDATE Products 
            SET PriceNew = Price;
        ");
    }
    
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn("PriceNew", "Products");
    }
}

// Migration 2: (After testing in production) Drop old column
public class RemoveOldPriceColumn : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn("Price", "Products");
        
        migrationBuilder.RenameColumn(
            name: "PriceNew",
            table: "Products",
            newName: "Price");
    }
    
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Reverse operation
        migrationBuilder.RenameColumn(
            name: "Price",
            table: "Products",
            newName: "PriceNew");
        
        migrationBuilder.AddColumn<decimal>(
            name: "Price",
            table: "Products",
            type: "TEXT",
            precision: 18,
            scale: 2,
            nullable: false,
            defaultValue: 0m);
    }
}
```

---

## 🎯 Key Takeaways

1. **SQLite stores `decimal` as `TEXT`** — type changes are less risky than you think
2. **Never use `AlterColumn`** — always use Add + Migrate + Drop
3. **Test restore of old backups** on new versions before deployment
4. **Pre-migration backups are automatic** — application won't start if backup fails
5. **Maintenance mode protects data** during restore operations
6. **Split risky migrations** into multiple steps with testing between
7. **Review generated migration code** before committing

---

## 📚 Related Files

- `backend/KasserPro.Infrastructure/Services/BackupService.cs`
- `backend/KasserPro.Infrastructure/Services/RestoreService.cs`
- `backend/KasserPro.Infrastructure/Services/DataValidationService.cs`
- `backend/KasserPro.API/Middleware/MaintenanceModeMiddleware.cs`
- `backend/KasserPro.Infrastructure/Data/AppDbContext.cs`
- `backend/KasserPro.API/Program.cs` (startup migration logic)

---

## 🔗 Additional Resources

- [EF Core Migrations Documentation](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [SQLite ALTER TABLE Limitations](https://www.sqlite.org/lang_altertable.html)
- [SQLite Type Affinity](https://www.sqlite.org/datatype3.html)
