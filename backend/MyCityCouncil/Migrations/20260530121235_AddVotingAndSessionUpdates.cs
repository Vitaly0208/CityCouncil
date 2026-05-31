using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyCityCouncil.Migrations
{
    /// <inheritdoc />
    public partial class AddVotingAndSessionUpdates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HearingRound",
                table: "VotingInfos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "FinalizedAt",
                table: "Sessions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "HearingRound",
                table: "Sessions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Votes_VoterId",
                table: "Votes",
                column: "VoterId");

            migrationBuilder.AddForeignKey(
                name: "FK_Votes_Users_VoterId",
                table: "Votes",
                column: "VoterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Votes_Users_VoterId",
                table: "Votes");

            migrationBuilder.DropIndex(
                name: "IX_Votes_VoterId",
                table: "Votes");

            migrationBuilder.DropColumn(
                name: "HearingRound",
                table: "VotingInfos");

            migrationBuilder.DropColumn(
                name: "FinalizedAt",
                table: "Sessions");

            migrationBuilder.DropColumn(
                name: "HearingRound",
                table: "Sessions");
        }
    }
}
