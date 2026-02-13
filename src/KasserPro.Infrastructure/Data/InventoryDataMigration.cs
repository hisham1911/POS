namespace KasserPro.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using KasserPro.Domain.Entities;

/// <summary>
/// ONE-TIME DATA MIGRATION: Migrate Product.StockQuantity to BranchInventory
/// This migration is IDEMPOTENT and can be safely run multiple times.
/// </summary>
public class InventoryDataMigration
{
    private readonly AppDbContext _context;
    private readonly ILogger<InventoryDataMigration> _logger;

    public InventoryDataMigration(AppDbContext context, ILogger<InventoryDataMigration> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Execute the inventory data migration
    /// </summary>
    public async Task<MigrationResult> ExecuteAsync()
    {
        var result = new MigrationResult
        {
            StartTime = DateTime.UtcNow
        };

        await using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            _logger.LogInformation("=== STARTING INVENTORY DATA MIGRATION ===");

            // Step 1: Check if migration already executed
            var existingInventories = await _context.BranchInventories.AnyAsync();
            if (existingInventories)
            {
                _logger.LogWarning("Migration already executed - BranchInventories table has data");
                result.AlreadyMigrated = true;
                result.Success = true;
                result.Message = "Migration already executed - skipping";
                return result;
            }

            // Step 2: Get all tenants
            var tenants = await _context.Tenants.ToListAsync();
            _logger.LogInformation("Found {TenantCount} tenants", tenants.Count);

            foreach (var tenant in tenants)
            {
                _logger.LogInformation("Processing tenant: {TenantName} (ID: {TenantId})", tenant.Name, tenant.Id);

                // Step 3: Get or identify default branch for this tenant
                var defaultBranch = await _context.Branches
                    .Where(b => b.TenantId == tenant.Id)
                    .OrderBy(b => b.Id)
                    .FirstOrDefaultAsync();

                if (defaultBranch == null)
                {
                    _logger.LogWarning("No branches found for tenant {TenantId} - skipping", tenant.Id);
                    continue;
                }

                _logger.LogInformation("Using default branch: {BranchName} (ID: {BranchId})", 
                    defaultBranch.Name, defaultBranch.Id);

                // Step 4: Get all products for this tenant
                var products = await _context.Products
                    .Where(p => p.TenantId == tenant.Id)
                    .ToListAsync();

                _logger.LogInformation("Found {ProductCount} products for tenant {TenantId}", 
                    products.Count, tenant.Id);

                // Step 5: Calculate total stock before migration
                var totalStockBefore = products.Sum(p => p.StockQuantity ?? 0);
                result.TotalStockBefore += totalStockBefore;

                _logger.LogInformation("Total stock before migration: {TotalStock}", totalStockBefore);

                // Step 6: Create BranchInventory records
                var inventoriesCreated = 0;
                var productsWithStock = 0;

                foreach (var product in products)
                {
                    var stockQuantity = product.StockQuantity ?? 0;
                    
                    // Create inventory record for ALL products (even with 0 stock)
                    // This ensures consistency and prevents issues later
                    var inventory = new BranchInventory
                    {
                        TenantId = tenant.Id,
                        BranchId = defaultBranch.Id,
                        ProductId = product.Id,
                        Quantity = stockQuantity,
                        ReorderLevel = product.ReorderPoint ?? product.LowStockThreshold ?? 10,
                        LastUpdatedAt = product.LastStockUpdate ?? DateTime.UtcNow
                    };

                    _context.BranchInventories.Add(inventory);
                    inventoriesCreated++;

                    if (stockQuantity > 0)
                    {
                        productsWithStock++;
                    }

                    // Mark product stock as migrated (set to 0)
                    // We keep StockQuantity column for backward compatibility but set to 0
                    product.StockQuantity = 0;
                    product.LastStockUpdate = DateTime.UtcNow;
                }

                _logger.LogInformation("Created {InventoryCount} inventory records ({WithStock} with stock > 0)", 
                    inventoriesCreated, productsWithStock);

                result.ProductsMigrated += products.Count;
                result.InventoriesCreated += inventoriesCreated;
                result.ProductsWithStock += productsWithStock;
            }

            // Step 7: Save all changes
            await _context.SaveChangesAsync();

            // Step 8: Verify migration
            var totalStockAfter = await _context.BranchInventories.SumAsync(i => i.Quantity);
            result.TotalStockAfter = totalStockAfter;

            _logger.LogInformation("Total stock after migration: {TotalStock}", totalStockAfter);

            // Step 9: Validation
            if (result.TotalStockBefore != result.TotalStockAfter)
            {
                var difference = result.TotalStockAfter - result.TotalStockBefore;
                _logger.LogError("VALIDATION FAILED: Stock mismatch! Before: {Before}, After: {After}, Difference: {Diff}",
                    result.TotalStockBefore, result.TotalStockAfter, difference);
                
                await transaction.RollbackAsync();
                result.Success = false;
                result.Message = $"Validation failed: Stock mismatch (difference: {difference})";
                return result;
            }

            // Step 10: Check for duplicates
            var duplicates = await _context.BranchInventories
                .GroupBy(i => new { i.BranchId, i.ProductId })
                .Where(g => g.Count() > 1)
                .CountAsync();

            if (duplicates > 0)
            {
                _logger.LogError("VALIDATION FAILED: Found {DuplicateCount} duplicate inventory records", duplicates);
                await transaction.RollbackAsync();
                result.Success = false;
                result.Message = $"Validation failed: {duplicates} duplicate records found";
                return result;
            }

            // Step 11: Commit transaction
            await transaction.CommitAsync();

            result.Success = true;
            result.Message = "Migration completed successfully";
            result.EndTime = DateTime.UtcNow;

            _logger.LogInformation("=== MIGRATION COMPLETED SUCCESSFULLY ===");
            _logger.LogInformation("Products migrated: {Count}", result.ProductsMigrated);
            _logger.LogInformation("Inventories created: {Count}", result.InventoriesCreated);
            _logger.LogInformation("Products with stock: {Count}", result.ProductsWithStock);
            _logger.LogInformation("Total stock: {Before} → {After}", result.TotalStockBefore, result.TotalStockAfter);
            _logger.LogInformation("Duration: {Duration}ms", result.DurationMs);

            return result;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            
            _logger.LogError(ex, "Migration failed with error");
            
            result.Success = false;
            result.Message = $"Migration failed: {ex.Message}";
            result.EndTime = DateTime.UtcNow;
            
            return result;
        }
    }
}

/// <summary>
/// Result of the inventory data migration
/// </summary>
public class MigrationResult
{
    public bool Success { get; set; }
    public bool AlreadyMigrated { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int ProductsMigrated { get; set; }
    public int InventoriesCreated { get; set; }
    public int ProductsWithStock { get; set; }
    public int TotalStockBefore { get; set; }
    public int TotalStockAfter { get; set; }
    
    public long DurationMs => (long)(EndTime - StartTime).TotalMilliseconds;

    public string GetSummary()
    {
        if (AlreadyMigrated)
        {
            return "✅ Migration already executed - no action needed";
        }

        if (!Success)
        {
            return $"❌ Migration failed: {Message}";
        }

        return $@"
✅ INVENTORY DATA MIGRATION COMPLETED SUCCESSFULLY

📊 Summary:
- Products migrated: {ProductsMigrated}
- Inventories created: {InventoriesCreated}
- Products with stock: {ProductsWithStock}
- Total stock before: {TotalStockBefore}
- Total stock after: {TotalStockAfter}
- Duration: {DurationMs}ms

✅ Validation:
- Stock totals match: ✓
- No duplicate records: ✓
- Transaction committed: ✓

🎯 Next Steps:
1. Verify orders continue working normally
2. Test inventory queries
3. Monitor for any issues
";
    }
}
