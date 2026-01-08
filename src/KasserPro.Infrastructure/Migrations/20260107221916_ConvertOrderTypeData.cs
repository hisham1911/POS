using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KasserPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    /// <summary>
    /// Converts existing OrderType string values to integer enum values.
    /// DineIn = 0, Takeaway = 1, Delivery = 2
    /// </summary>
    public partial class ConvertOrderTypeData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Convert string OrderType values to integers
            // This handles both old snake_case and new PascalCase values
            migrationBuilder.Sql(@"
                UPDATE Orders 
                SET OrderType = CASE 
                    WHEN OrderType = 'dine_in' OR OrderType = 'DineIn' OR OrderType = '0' THEN 0
                    WHEN OrderType = 'takeaway' OR OrderType = 'Takeaway' OR OrderType = '1' THEN 1
                    WHEN OrderType = 'delivery' OR OrderType = 'Delivery' OR OrderType = '2' THEN 2
                    ELSE 0
                END
                WHERE OrderType NOT IN ('0', '1', '2') 
                   OR typeof(OrderType) = 'text';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Convert integer OrderType values back to strings
            migrationBuilder.Sql(@"
                UPDATE Orders 
                SET OrderType = CASE OrderType
                    WHEN 0 THEN 'dine_in'
                    WHEN 1 THEN 'takeaway'
                    WHEN 2 THEN 'delivery'
                    ELSE 'dine_in'
                END;
            ");
        }
    }
}
