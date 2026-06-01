using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyCityCouncil.Migrations
{
    /// <inheritdoc />
    public partial class AddCommitteeToInitiativeAndOnlineFlagToAttendee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCurrentlyOnSession",
                table: "SessionAttendees",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "CommitteeId",
                table: "Initiatives",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Initiatives_CommitteeId",
                table: "Initiatives",
                column: "CommitteeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Initiatives_Committees_CommitteeId",
                table: "Initiatives",
                column: "CommitteeId",
                principalTable: "Committees",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Initiatives_Committees_CommitteeId",
                table: "Initiatives");

            migrationBuilder.DropIndex(
                name: "IX_Initiatives_CommitteeId",
                table: "Initiatives");

            migrationBuilder.DropColumn(
                name: "IsCurrentlyOnSession",
                table: "SessionAttendees");

            migrationBuilder.DropColumn(
                name: "CommitteeId",
                table: "Initiatives");
        }
    }
}
