using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using MyCityCouncil.Api.Controllers.Requests;
using MyCityCouncil.Application.Features.Voting.CastVote;
using MyCityCouncil.Application.Features.Sessions.Finalize;

namespace MyCityCouncil.Api.Controllers;

[ApiController]
[Route("api/voting")]
[Authorize]
public class VotingController : ControllerBase
{
    private readonly IMediator _mediator;
    
    public VotingController(IMediator mediator) => _mediator = mediator;

    [HttpPost("cast")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CastVote([FromBody] CastVoteRequest request, CancellationToken ct)
    {
        var userId = GetUserIdFromToken();
        var command = new CastVoteCommand(
            request.SessionId, 
            request.InitiativeId, 
            request.VoteType, 
            userId
        );
        await _mediator.Send(command, ct);
        return Ok(new { message = "Голос успешно принят" });
    }

    [HttpPost("finalize/{sessionId:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> FinalizeSession(Guid sessionId, CancellationToken ct)
    {
        await _mediator.Send(new FinalizeSessionCommand(sessionId), ct);
        return Ok(new { message = "Сессия закрыта. Итоги подведены, статусы инициатив обновлены." });
    }
    
    private Guid GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirstValue("userId") 
                       ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Не удалось определить пользователя из токена");
        }
        return userId;
    }
}