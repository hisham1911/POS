using Microsoft.Data.Sqlite;
using System;
using System.IO;

class FixInventoryScript
{
    static void Main(string[] args)
    {
        var dbPath = "kasserpro.db";
        
        if (!File.Exists(dbPath))
        {
            Console.WriteLine($"❌ Database file not found: {dbPath}");
            return;
        }

        var connectionString = $"Data Source={dbPath}";
        
        using var connection = new SqliteConnection(connectionString);
        connection.Open();

        Console.WriteLine("🔍 Checking current state...\n");

        // Step 1: Check products with StockQuantity > 0
        var productsWithStock = ExecuteScalar(connection, 
            "SELECT COUNT(*) FROM Products WHERE StockQuantity > 0 AND IsActive = 1");
        Console.WriteLine($"Products with StockQuantity > 0: {productsWithStock}");

        // Step 2: Check products in BranchInventory
        var productsInInventory = ExecuteScalar(connection,
            "SELECT COUNT(DISTINCT ProductId) FROM BranchInventories");
        Console.WriteLine($"Products in BranchInventory: {productsInInventory}");

        // Step 3: Check missing products
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
            return;
        }

        Console.WriteLine("📋 Products that will be fixed:");
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
    }

    static void ShowMissingProducts(SqliteConnection connection)
    {
        var sql = @"
            SELECT p.Id, p.Name, p.StockQuantity, p.LowStockThreshold, p.TenantId
            FROM Products p
            WHERE p.IsActive = 1 
              AND p.TrackInventory = 1
              AND NOT EXISTS (
                  SELECT 1 FROM BranchInventories bi 
                  WHERE bi.ProductId = p.Id
              )
            ORDER BY p.TenantId, p.Name
            LIMIT 10";

        using var command = connection.CreateCommand();
        command.CommandText = sql;
        using var reader = command.ExecuteReader();

        while (reader.Read())
        {
            Console.WriteLine($"  - ID: {reader.GetInt32(0)}, Name: {reader.GetString(1)}, Stock: {reader.GetValue(2)}, Threshold: {reader.GetValue(3)}");
        }
    }

    static void ShowSummary(SqliteConnection connection)
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

        using var command = connection.CreateCommand();
        command.CommandText = sql;
        using var reader = command.ExecuteReader();

        while (reader.Read())
        {
            Console.WriteLine($"  {reader.GetString(0)}: {reader.GetInt32(1)} products, {reader.GetInt32(2)} branches, {reader.GetInt32(3)} total stock");
        }
    }

    static long ExecuteScalar(SqliteConnection connection, string sql)
    {
        using var command = connection.CreateCommand();
        command.CommandText = sql;
        var result = command.ExecuteScalar();
        return result != null ? Convert.ToInt64(result) : 0;
    }

    static int ExecuteNonQuery(SqliteConnection connection, string sql)
    {
        using var command = connection.CreateCommand();
        command.CommandText = sql;
        return command.ExecuteNonQuery();
    }
}
