using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using MyCityCouncil.Application.Features.Committees.Create;
using MyCityCouncil.Application.Features.Committees.Delete;
using MyCityCouncil.Application.Features.Committees.GetDetails;
using MyCityCouncil.Application.Features.Committees.GetList;
using MyCityCouncil.Application.Features.Committees.Members;
using MyCityCouncil.Application.Features.Committees.Members.AddMember;
using MyCityCouncil.Application.Features.Committees.Members.AppointChairman;
using MyCityCouncil.Application.Features.Committees.Members.Dismiss;


namespace MyCityCouncil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommitteesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CommitteesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [ProducesResponseType(typeof(List<CommitteesListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CommitteesListDto>>> GetAll(CancellationToken ct)
    {
        var query = new GetCommitteesListQuery();
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CommitteeDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CommitteeDetailsDto>> GetDetails(Guid id, CancellationToken ct)
    {
        var query = new GetCommitteeDetailsQuery(id);
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(CreateCommitteeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateCommitteeDto>> Create([FromBody] CreateCommitteeCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetDetails), new { id = result.Id }, result);
    }
    
    [HttpPost("{id}/members")]
    [ProducesResponseType(typeof(MembershipDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MembershipDto>> AddMember(Guid id, [FromBody] AddMemberCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command with { CommitteeId = id }, ct);
        return CreatedAtAction(nameof(GetMember), new { committeeId = id, userId = result.UserId }, result);
    }
    
    [HttpPost("{id}/chairman")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(MembershipDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MembershipDto>> AppointChairman(Guid id, [FromBody] AppointChairmanCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command with { CommitteeId = id }, ct);
        return Ok(result);
    }
    
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        try
        {
            await _mediator.Send(new DeleteCommitteeCommand(id), ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Комиссия не найдена" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}/members/{userId}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DismissMember(Guid id, Guid userId, CancellationToken ct)
    {
        var command = new DismissMemberCommand(id, userId);
        await _mediator.Send(command, ct);
        return NoContent();
    }

    [HttpGet("{committeeId}/members/{userId}")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public ActionResult<MembershipDto> GetMember(Guid committeeId, Guid userId) => 
        NotFound();
}