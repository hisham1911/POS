using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KasserPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnableTrackInventoryForAllProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Enable TrackInventory for all existing products
            migrationBuilder.Sql("UPDATE Products SET TrackInventory = 1 WHERE TrackInventory = 0");
            
            // Set StockQuantity to 0 for products that have NULL
            migrationBuilder.Sql("UPDATE Products SET StockQuantity = 0 WHERE StockQuantity IS NULL");
            
            // Set default LowStockThreshold for products that have NULL
            migrationBuilder.Sql("UPDATE Products SET LowStockThreshold = 5 WHERE LowStockThreshold IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No rollback needed - this is a data-only migration
        }
    }
}
