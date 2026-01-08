using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KasserPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantTaxSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Timezone",
                table: "Tenants",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                defaultValue: "Africa/Cairo",
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                table: "Tenants",
                type: "TEXT",
                maxLength: 10,
                nullable: false,
                defaultValue: "EGP",
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AddColumn<bool>(
                name: "IsTaxEnabled",
                table: "Tenants",
                type: "INTEGER",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxRate",
                table: "Tenants",
                type: "TEXT",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 14.0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsTaxEnabled",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "TaxRate",
                table: "Tenants");

            migrationBuilder.AlterColumn<string>(
                name: "Timezone",
                table: "Tenants",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 50,
                oldDefaultValue: "Africa/Cairo");

            migrationBuilder.AlterColumn<string>(
                name: "Currency",
                table: "Tenants",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 10,
                oldDefaultValue: "EGP");
        }
    }
}
