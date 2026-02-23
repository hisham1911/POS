using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KasserPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PurchaseInvoices_SupplierId",
                table: "PurchaseInvoices");

            migrationBuilder.DropIndex(
                name: "IX_Products_CategoryId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Orders_ShiftId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_BranchInventories_BranchId_ProductId",
                table: "BranchInventories");

            migrationBuilder.CreateTable(
                name: "UserPermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Permission = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPermissions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_UserId_IsClosed_OpenedAt",
                table: "Shifts",
                columns: new[] { "UserId", "IsClosed", "OpenedAt" },
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseInvoices_SupplierId_InvoiceDate",
                table: "PurchaseInvoices",
                columns: new[] { "SupplierId", "InvoiceDate" },
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId_IsActive",
                table: "Products",
                columns: new[] { "CategoryId", "IsActive" },
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_ShiftId_CreatedAt",
                table: "Orders",
                columns: new[] { "ShiftId", "CreatedAt" },
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CategoryId_Status_ExpenseDate",
                table: "Expenses",
                columns: new[] { "CategoryId", "Status", "ExpenseDate" },
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_CashRegisterTransactions_ShiftId_Type_CreatedAt",
                table: "CashRegisterTransactions",
                columns: new[] { "ShiftId", "Type", "CreatedAt" },
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_BranchInventories_BranchId_ProductId",
                table: "BranchInventories",
                columns: new[] { "BranchId", "ProductId" },
                unique: true,
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_UserId_Permission",
                table: "UserPermissions",
                columns: new[] { "UserId", "Permission" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserPermissions");

            migrationBuilder.DropIndex(
                name: "IX_Shifts_UserId_IsClosed_OpenedAt",
                table: "Shifts");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseInvoices_SupplierId_InvoiceDate",
                table: "PurchaseInvoices");

            migrationBuilder.DropIndex(
                name: "IX_Products_CategoryId_IsActive",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Orders_ShiftId_CreatedAt",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_CategoryId_Status_ExpenseDate",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_CashRegisterTransactions_ShiftId_Type_CreatedAt",
                table: "CashRegisterTransactions");

            migrationBuilder.DropIndex(
                name: "IX_BranchInventories_BranchId_ProductId",
                table: "BranchInventories");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseInvoices_SupplierId",
                table: "PurchaseInvoices",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_ShiftId",
                table: "Orders",
                column: "ShiftId");

            migrationBuilder.CreateIndex(
                name: "IX_BranchInventories_BranchId_ProductId",
                table: "BranchInventories",
                columns: new[] { "BranchId", "ProductId" },
                unique: true);
        }
    }
}
