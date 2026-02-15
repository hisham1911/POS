using Microsoft.Data.Sqlite;
using System;
using System.IO;

// Simple script to fix missing BranchInventory records
// Run with: dotnet script RunInventoryMigration.cs

var dbPath = "kasserpro.db";

if (!File.Exists(dbPath))
{
    Console.WriteLine($"❌ Database file not found: {dbPath}");
    Console.WriteLine("Make sure you're running this from the project root directory.");
    return;
}

var connectionString = $"Data Source={dbPath}";

using var connection = new SqliteConnection(connectionString);
connection.Open();

Console.WriteLine("🔍 Checking current state...\n");

// Check products with StockQuantity > 0
var productsWithStock = ExecuteScalar(connection, 
    "SELECT COUNT(*) FROM Products WHERE StockQuantity > 0 AND IsActive = 1");
Console.WriteLine($"Products with StockQuantity > 0: {productsWithStock}");

// Check products in BranchInventory
var productsInInventory = ExecuteScalar(connection,
    "SELECT COUNT(DISTINCT ProductId) FROM BranchInventories");
Console.WriteLine($"Products in BranchInventory: {productsInInventory}");

// Check missing products
var missingProducts = ExecuteScalar(connection,
    @"SELECT COUNT(*) FROM Products p
      WHERE p.IsActive = 1 
        AND p.TrackInventory = 1
        AND NOT EXISTS (
            SELECT 1 FROM BranchInventories bi 
            WHERE bi.ProductId = p.Id
        )");
Console.WriteLine($"Products missing from BranchInventory: {missingProducts}\n");

if (missingProducts == 0)
{
    Console.WriteLine("✅ All products already have BranchInventory records!");
    Console.WriteLine("No migration needed.");
    return;
}

Console.WriteLine("📋 Sample of products that will be fixed:");
ShowMissingProducts(connection);

Console.WriteLine("\n🔧 Creating missing BranchInventory records...");

// Create missing records
var insertSql = @"
    INSERT INTO BranchInventories (TenantId, BranchId, ProductId, Quantity, ReorderLevel, LastUpdatedAt, CreatedAt, UpdatedAt)
    SELECT 
        p.TenantId,
        b.Id as BranchId,
        p.Id as ProductId,
        COALESCE(p.StockQuantity, 0) as Quantity,
        COALESCE(p.LowStockThreshold, 10) as ReorderLevel,
        COALESCE(p.LastStockUpdate, datetime('now')) as LastUpdatedAt,
        datetime('now') as CreatedAt,
        datetime('now') as UpdatedAt
    FROM Products p
    CROSS JOIN Branches b
    WHERE p.IsActive = 1
      AND p.TrackInventory = 1
      AND p.TenantId = b.TenantId
      AND NOT EXISTS (
          SELECT 1 FROM BranchInventories bi 
          WHERE bi.ProductId = p.Id AND bi.BranchId = b.Id
      )";

var rowsInserted = ExecuteNonQuery(connection, insertSql);
Console.WriteLine($"✅ Created {rowsInserted} BranchInventory records\n");

// Verify
Console.WriteLine("🔍 Verification:");
var productsInInventoryAfter = ExecuteScalar(connection,
    "SELECT COUNT(DISTINCT ProductId) FROM BranchInventories");
Console.WriteLine($"Products now in BranchInventory: {productsInInventoryAfter}");

var totalRecords = ExecuteScalar(connection,
    "SELECT COUNT(*) FROM BranchInventories");
Console.WriteLine($"Total BranchInventory records: {totalRecords}");

Console.WriteLine("\n📊 Summary by Tenant:");
ShowSummary(connection);

Console.WriteLine("\n✅ Done! All products now have BranchInventory records.");
Console.WriteLine("You can now see all products in the inventory page.");

void ShowMissingProducts(SqliteConnection conn)
{
    var sql = @"
        SELECT p.Id, p.Name, p.StockQuantity, p.LowStockThreshold
        FROM Products p
        WHERE p.IsActive = 1 
          AND p.TrackInventory = 1
          AND NOT EXISTS (
              SELECT 1 FROM BranchInventories bi 
              WHERE bi.ProductId = p.Id
          )
        ORDER BY p.Name
        LIMIT 10";

    using var command = conn.CreateCommand();
    command.CommandText = sql;
    using var reader = command.ExecuteReader();

    while (reader.Read())
    {
        var id = reader.GetInt32(0);
        var name = reader.GetString(1);
        var stock = reader.IsDBNull(2) ? 0 : reader.GetInt32(2);
        var threshold = reader.IsDBNull(3) ? 0 : reader.GetInt32(3);
        Console.WriteLine($"  - ID: {id}, Name: {name}, Stock: {stock}, Threshold: {threshold}");
    }
    
    if (missingProducts > 10)
    {
        Console.WriteLine($"  ... and {missingProducts - 10} more");
    }
}

void ShowSummary(SqliteConnection conn)
{
    var sql = @"
        SELECT 
            t.Name as TenantName,
            COUNT(DISTINCT bi.ProductId) as ProductsInInventory,
            COUNT(DISTINCT bi.BranchId) as BranchesWithInventory,
            SUM(bi.Quantity) as TotalStock
        FROM BranchInventories bi
        JOIN Tenants t ON bi.TenantId = t.Id
        GROUP BY t.Id, t.Name
        ORDER BY t.Name";

    using var command = conn.CreateCommand();
    command.CommandText = sql;
    using var reader = command.ExecuteReader();

    while (reader.Read())
    {
        var tenant = reader.GetString(0);
        var products = reader.GetInt32(1);
        var branches = reader.GetInt32(2);
        var stock = reader.GetInt32(3);
        Console.WriteLine($"  {tenant}: {products} products, {branches} branches, {stock} total stock");
    }
}

long ExecuteScalar(SqliteConnection conn, string sql)
{
    using var command = conn.CreateCommand();
    command.CommandText = sql;
    var result = command.ExecuteScalar();
    return result != null ? Convert.ToInt64(result) : 0;
}

int ExecuteNonQuery(SqliteConnection conn, string sql)
{
    using var command = conn.CreateCommand();
    command.CommandText = sql;
    return command.ExecuteNonQuery();
}
