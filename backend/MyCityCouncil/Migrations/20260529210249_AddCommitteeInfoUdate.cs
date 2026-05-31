using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyCityCouncil.Migrations
{
    /// <inheritdoc />
    public partial class AddCommitteeInfoUdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "CommitteesInfo",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "CommitteesInfo");
        }
    }
}
