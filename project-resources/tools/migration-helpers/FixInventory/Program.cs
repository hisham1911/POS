using Microsoft.Data.Sqlite;
using System;

var script = @"
INSERT INTO BranchInventories (TenantId, BranchId, ProductId, Quantity, ReorderLevel, LastUpdatedAt, IsDeleted, CreatedAt, UpdatedAt)
SELECT 
    p.TenantId,
    b.Id as BranchId,
    p.Id as ProductId,
    p.StockQuantity as Quantity,
    COALESCE(p.LowStockThreshold, 10) as ReorderLevel,
    datetime('now') as LastUpdatedAt,
    0 as IsDeleted,
    datetime('now') as CreatedAt,
    datetime('now') as UpdatedAt
FROM Products p
CROSS JOIN Branches b
WHERE p.TenantId = b.TenantId
  AND p.IsDeleted = 0
  AND b.IsDeleted = 0
  AND NOT EXISTS (
    SELECT 1 FROM BranchInventories bi
    WHERE bi.ProductId = p.Id 
      AND bi.BranchId = b.Id
      AND bi.IsDeleted = 0
  );
";

using var conn = new SqliteConnection("Data Source=../kasserpro.db");
conn.Open();

using var cmd = conn.CreateCommand();

// Show current state
cmd.CommandText = "SELECT COUNT(*) FROM Products WHERE IsDeleted=0";
var productCount = (long)cmd.ExecuteScalar()!;

cmd.CommandText = "SELECT COUNT(*) FROM BranchInventories WHERE IsDeleted=0";
var inventoryCountBefore = (long)cmd.ExecuteScalar()!;

cmd.CommandText = "SELECT COUNT(*) FROM BranchInventories WHERE IsDeleted=0 AND TenantId=1 AND BranchId=1";
var inventoryForBranch1 = (long)cmd.ExecuteScalar()!;

Console.WriteLine($"Before: Products={productCount}, BranchInventories={inventoryCountBefore}, Branch1Inventory={inventoryForBranch1}");

// Execute the insert
cmd.CommandText = script;
var affected = cmd.ExecuteNonQuery();
Console.WriteLine($"✓ Created {affected} BranchInventories records");

// Show counts after
cmd.CommandText = "SELECT COUNT(*) FROM BranchInventories WHERE IsDeleted=0";
var inventoryCountAfter = (long)cmd.ExecuteScalar()!;

cmd.CommandText = "SELECT COUNT(*) FROM BranchInventories WHERE IsDeleted=0 AND TenantId=1 AND BranchId=1";
var inventoryForBranch1After = (long)cmd.ExecuteScalar()!;

Console.WriteLine($"After: BranchInventories={inventoryCountAfter}, Branch1Inventory={inventoryForBranch1After}");

// Show sample records
cmd.CommandText = @"
SELECT p.Name, bi.Quantity, bi.IsDeleted, bi.TenantId, bi.BranchId
FROM BranchInventories bi
JOIN Products p ON p.Id = bi.ProductId
WHERE bi.BranchId = 1
LIMIT 5";

using var reader = cmd.ExecuteReader();
Console.WriteLine("\nSample records for Branch 1:");
while (reader.Read())
{
    Console.WriteLine($"  {reader[0]}: Qty={reader[1]}, IsDeleted={reader[2]}, TenantId={reader[3]}, BranchId={reader[4]}");
}

conn.Close();
