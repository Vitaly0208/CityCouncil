using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using MyCityCouncil.Application.Features.Sessions;
using MyCityCouncil.Application.Features.Sessions.Create;
using MyCityCouncil.Application.Features.Sessions.GetAll;
using MyCityCouncil.Application.Features.Sessions.GetById;

namespace MyCityCouncil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    private readonly IMediator _mediator;
    public SessionsController(IMediator mediator) => _mediator = mediator;
    
    
    [HttpPost("create")]
    [Authorize(Roles = "Admin,Chairman")]
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
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var query = new GetSessionDetailsQuery(id);
        var session = await _mediator.Send(query, ct);
    
        return session is null ? NotFound() : Ok(session);
    }
    
}