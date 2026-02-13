using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KasserPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceShiftManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ForceCloseReason",
                table: "Shifts",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ForceClosedAt",
                table: "Shifts",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ForceClosedByUserId",
                table: "Shifts",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ForceClosedByUserName",
                table: "Shifts",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "HandedOverAt",
                table: "Shifts",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HandedOverFromUserId",
                table: "Shifts",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HandedOverFromUserName",
                table: "Shifts",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HandedOverToUserId",
                table: "Shifts",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HandedOverToUserName",
                table: "Shifts",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "HandoverBalance",
                table: "Shifts",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "HandoverNotes",
                table: "Shifts",
                type: "TEXT",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsForceClosed",
                table: "Shifts",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsHandedOver",
                table: "Shifts",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastActivityAt",
                table: "Shifts",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_ForceClosedByUserId",
                table: "Shifts",
                column: "ForceClosedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_HandedOverFromUserId",
                table: "Shifts",
                column: "HandedOverFromUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_HandedOverToUserId",
                table: "Shifts",
                column: "HandedOverToUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Shifts_Users_ForceClosedByUserId",
                table: "Shifts",
                column: "ForceClosedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Shifts_Users_HandedOverFromUserId",
                table: "Shifts",
                column: "HandedOverFromUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Shifts_Users_HandedOverToUserId",
                table: "Shifts",
                column: "HandedOverToUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Shifts_Users_ForceClosedByUserId",
                table: "Shifts");

            migrationBuilder.DropForeignKey(
                name: "FK_Shifts_Users_HandedOverFromUserId",
                table: "Shifts");

            migrationBuilder.DropForeignKey(
                name: "FK_Shifts_Users_HandedOverToUserId",
                table: "Shifts");

            migrationBuilder.DropIndex(
                name: "IX_Shifts_ForceClosedByUserId",
                table: "Shifts");

            migrationBuilder.DropIndex(
                name: "IX_Shifts_HandedOverFromUserId",
                table: "Shifts");

            migrationBuilder.DropIndex(
                name: "IX_Shifts_HandedOverToUserId",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "ForceCloseReason",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "ForceClosedAt",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "ForceClosedByUserId",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "ForceClosedByUserName",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "HandedOverAt",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "HandedOverFromUserId",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "HandedOverFromUserName",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "HandedOverToUserId",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "HandedOverToUserName",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "HandoverBalance",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "HandoverNotes",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "IsForceClosed",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "IsHandedOver",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "LastActivityAt",
                table: "Shifts");
        }
    }
}
