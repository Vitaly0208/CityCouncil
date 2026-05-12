using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyCityCouncil.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Committees",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Committees", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Party",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Abbreviation = table.Column<string>(type: "text", nullable: true),
                    Ideology = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Party", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    HeldAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CommitteeId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sessions_Committees_CommitteeId",
                        column: x => x.CommitteeId,
                        principalTable: "Committees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MiddleName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    LastName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Password = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    HomePhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    WorkPhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CommitteesInfo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CStatus = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AppointedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DismissedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CommitteeId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommitteesInfo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommitteesInfo_Committees_CommitteeId",
                        column: x => x.CommitteeId,
                        principalTable: "Committees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CommitteesInfo_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Initiatives",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FinalizedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Initiatives", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Initiatives_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PartiesInfo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PStatus = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AppointedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DismissedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    PartyId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartiesInfo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PartiesInfo_Party_PartyId",
                        column: x => x.PartyId,
                        principalTable: "Party",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PartiesInfo_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VotingInfos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SessionTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    InitiativeTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    VotesFor = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    VotesAgainst = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    VotedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    IsFinalized = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    InitiativeId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VotingInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VotingInfos_Initiatives_InitiativeId",
                        column: x => x.InitiativeId,
                        principalTable: "Initiatives",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VotingInfos_Sessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "Sessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Committees_Name",
                table: "Committees",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CommitteesInfo_CommitteeActiveStatus",
                table: "CommitteesInfo",
                columns: new[] { "CommitteeId", "DismissedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_CommitteesInfo_UserActiveStatus",
                table: "CommitteesInfo",
                columns: new[] { "UserId", "DismissedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Initiatives_QueueSorting",
                table: "Initiatives",
                columns: new[] { "Status", "ApprovedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Initiatives_Status",
                table: "Initiatives",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Initiatives_UserId",
                table: "Initiatives",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PartiesInfo_PartyId",
                table: "PartiesInfo",
                column: "PartyId");

            migrationBuilder.CreateIndex(
                name: "IX_PartiesInfo_UserActiveStatus",
                table: "PartiesInfo",
                columns: new[] { "UserId", "DismissedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_CommitteeDate",
                table: "Sessions",
                columns: new[] { "CommitteeId", "HeldAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_HeldAt",
                table: "Sessions",
                column: "HeldAt");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_VotingInfos_InitiativeId",
                table: "VotingInfos",
                column: "InitiativeId");

            migrationBuilder.CreateIndex(
                name: "IX_VotingInfos_IsFinalized",
                table: "VotingInfos",
                column: "IsFinalized");

            migrationBuilder.CreateIndex(
                name: "UQ_VotingInfos_SessionInitiative",
                table: "VotingInfos",
                columns: new[] { "SessionId", "InitiativeId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CommitteesInfo");

            migrationBuilder.DropTable(
                name: "PartiesInfo");

            migrationBuilder.DropTable(
                name: "VotingInfos");

            migrationBuilder.DropTable(
                name: "Party");

            migrationBuilder.DropTable(
                name: "Initiatives");

            migrationBuilder.DropTable(
                name: "Sessions");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Committees");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
