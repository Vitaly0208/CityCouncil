using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using MyCityCouncil.Application.Features.Voting.CastVote;
using MyCityCouncil.Application.Features.Sessions.Finalize;
using MyCityCouncil.Domain.Enums;
using System.Security.Claims;

namespace MyCityCouncil.Api.Controllers;

[ApiController]
[Route("api/voting")]
[Authorize]
public class VotingController : ControllerBase
{
    private readonly IMediator _mediator;
    public VotingController(IMediator mediator) => _mediator = mediator;

    [HttpPost("cast")]
    public async Task<IActionResult> CastVote([FromBody] CastVoteRequest request, CancellationToken ct)
    {
        var userIdClaim = User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized("Не удалось определить пользователя");

        var command = new CastVoteCommand(request.SessionId, request.InitiativeId, request.VoteType, userId);
        await _mediator.Send(command, ct);
        return Ok(new { message = "Голос успешно принят" });
    }

    [HttpPost("finalize/{sessionId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> FinalizeSession(Guid sessionId, CancellationToken ct)
    {
        await _mediator.Send(new FinalizeSessionCommand(sessionId), ct);
        return Ok(new { message = "Сессия закрыта. Итоги подведены, статусы инициатив обновлены." });
    }
}

public class CastVoteRequest
{
    public Guid SessionId { get; set; }
    public Guid InitiativeId { get; set; }
    public VoteType VoteType { get; set; }
}