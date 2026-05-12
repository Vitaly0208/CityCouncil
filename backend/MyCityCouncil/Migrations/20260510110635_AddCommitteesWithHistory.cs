using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyCityCouncil.Migrations
{
    /// <inheritdoc />
    public partial class AddCommitteesWithHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CommitteesInfo_UserActiveStatus",
                table: "CommitteesInfo");

            migrationBuilder.AlterColumn<string>(
                name: "CStatus",
                table: "CommitteesInfo",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Committees",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000);

            migrationBuilder.AddColumn<string>(
                name: "Specialization",
                table: "Committees",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_CommitteesInfo_HistoryRange",
                table: "CommitteesInfo",
                columns: new[] { "CommitteeId", "AppointedAt", "DismissedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_CommitteesInfo_OneActiveChairman",
                table: "CommitteesInfo",
                columns: new[] { "CommitteeId", "IsChairman" },
                unique: true,
                filter: "\"IsChairman\" = true AND \"DismissedAt\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CommitteesInfo_UserId",
                table: "CommitteesInfo",
                column: "UserId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CommitteesInfo_DateRange",
                table: "CommitteesInfo",
                sql: "\"DismissedAt\" IS NULL OR \"DismissedAt\" >= \"AppointedAt\"");

            migrationBuilder.CreateIndex(
                name: "IX_Committees_Specialization",
                table: "Committees",
                column: "Specialization");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CommitteesInfo_HistoryRange",
                table: "CommitteesInfo");

            migrationBuilder.DropIndex(
                name: "IX_CommitteesInfo_OneActiveChairman",
                table: "CommitteesInfo");

            migrationBuilder.DropIndex(
                name: "IX_CommitteesInfo_UserId",
                table: "CommitteesInfo");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CommitteesInfo_DateRange",
                table: "CommitteesInfo");

            migrationBuilder.DropIndex(
                name: "IX_Committees_Specialization",
                table: "Committees");

            migrationBuilder.DropColumn(
                name: "Specialization",
                table: "Committees");

            migrationBuilder.AlterColumn<string>(
                name: "CStatus",
                table: "CommitteesInfo",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Committees",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CommitteesInfo_UserActiveStatus",
                table: "CommitteesInfo",
                columns: new[] { "UserId", "DismissedAt" });
        }
    }
}
