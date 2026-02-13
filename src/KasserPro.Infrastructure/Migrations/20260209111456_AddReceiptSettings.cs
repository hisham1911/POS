using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KasserPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReceiptSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ReceiptBodyFontSize",
                table: "Tenants",
                type: "INTEGER",
                nullable: false,
                defaultValue: 9);

            migrationBuilder.AddColumn<string>(
                name: "ReceiptFooterMessage",
                table: "Tenants",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReceiptHeaderFontSize",
                table: "Tenants",
                type: "INTEGER",
                nullable: false,
                defaultValue: 12);

            migrationBuilder.AddColumn<string>(
                name: "ReceiptPaperSize",
                table: "Tenants",
                type: "TEXT",
                maxLength: 10,
                nullable: false,
                defaultValue: "80mm");

            migrationBuilder.AddColumn<string>(
                name: "ReceiptPhoneNumber",
                table: "Tenants",
                type: "TEXT",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ReceiptShowBranchName",
                table: "Tenants",
                type: "INTEGER",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "ReceiptShowCashier",
                table: "Tenants",
                type: "INTEGER",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "ReceiptShowThankYou",
                table: "Tenants",
                type: "INTEGER",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "ReceiptTotalFontSize",
                table: "Tenants",
                type: "INTEGER",
                nullable: false,
                defaultValue: 11);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReceiptBodyFontSize",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ReceiptFooterMessage",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ReceiptHeaderFontSize",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ReceiptPaperSize",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ReceiptPhoneNumber",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ReceiptShowBranchName",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ReceiptShowCashier",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ReceiptShowThankYou",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ReceiptTotalFontSize",
                table: "Tenants");
        }
    }
}
