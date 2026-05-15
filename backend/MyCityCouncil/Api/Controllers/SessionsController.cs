using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using MyCityCouncil.Application.Features.Sessions;
using MyCityCouncil.Application.Features.Sessions.Create;

namespace MyCityCouncil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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
    
    [HttpGet("{id}")]
    public ActionResult GetById(Guid id) => Ok(); 
}