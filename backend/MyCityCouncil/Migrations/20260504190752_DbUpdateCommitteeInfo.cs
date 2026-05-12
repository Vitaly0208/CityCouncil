using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyCityCouncil.Migrations
{
    /// <inheritdoc />
    public partial class DbUpdateCommitteeInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "CommitteesInfo");

            migrationBuilder.AddColumn<bool>(
                name: "IsChairman",
                table: "CommitteesInfo",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ArchivedAt",
                table: "Committees",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Committees",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsChairman",
                table: "CommitteesInfo");

            migrationBuilder.DropColumn(
                name: "ArchivedAt",
                table: "Committees");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Committees");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "CommitteesInfo",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
