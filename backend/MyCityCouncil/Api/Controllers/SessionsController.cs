using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using MyCityCouncil.Application.Features.Sessions;
using MyCityCouncil.Application.Features.Sessions.Create;
using MyCityCouncil.Application.Features.Sessions.GetAll;
using MyCityCouncil.Application.Features.Sessions.GetById;
using MyCityCouncil.Application.Features.Sessions.JoinSession;
using MyCityCouncil.Application.Features.Sessions.LeaveSession;
using MyCityCouncil.Application.Features.Sessions.Protocol;

namespace MyCityCouncil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    private readonly IMediator _mediator;
    public SessionsController(IMediator mediator) => _mediator = mediator;
    
    
    [HttpPost("create")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(SessionDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<SessionDto>> Create([FromBody] CreateSessionWithQueueCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
    
    [HttpPost("create-with-queue")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(SessionDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<SessionDto>> CreateWithQueue(
        [FromBody] CreateSessionWithQueueCommand command, 
        CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
        
    [HttpGet]
    [AllowAnonymous] 
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<SessionListDto>))]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? committeeId,
        [FromQuery] bool? isCompleted,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var query = new GetAllSessionsQuery(committeeId, isCompleted, page, pageSize);
        var sessions = await _mediator.Send(query, ct);
        return Ok(sessions);
    }
    
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SessionDetailDto))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [AllowAnonymous] 
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var query = new GetSessionDetailsQuery(id);
        var session = await _mediator.Send(query, ct);
    
        return session is null ? NotFound() : Ok(session);
    }
    
    [HttpPost("{id}/join")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> JoinSession(Guid id, CancellationToken ct)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return BadRequest("Не удалось определить пользователя");

        try
        {
            var command = new JoinSessionCommand(id, userId);
            await _mediator.Send(command, ct);
            
            return Ok(new { message = "Вы успешно присоединились к заседанию" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPatch("{id}/leave")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> LeaveSession(Guid id, CancellationToken ct)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return BadRequest("Не удалось определить пользователя");

        try
        {
            await _mediator.Send(new LeaveSessionCommand(id, userId), ct);
            return Ok(new { message = "Вы покинули заседание" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/attendees")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<AttendeeDto>))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAttendees(Guid id, CancellationToken ct)
    {
        var session = await _mediator.Send(new GetSessionDetailsQuery(id), ct);
        
        if (session == null)
            return NotFound();
        
        return Ok(session.Attendees);
    }
    
    [HttpGet("{id:guid}/protocol")]
    [AllowAnonymous] 
    [ProducesResponseType(typeof(SessionProtocolDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProtocol(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetSessionProtocolQuery(id), ct);
        if (result == null) return NotFound("Заседание не найдено или ещё не завершено");
        
        return Ok(result);
    }
    
}