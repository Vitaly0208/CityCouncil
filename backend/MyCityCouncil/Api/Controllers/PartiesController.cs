using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using MyCityCouncil.Api.Controllers.Requests;
using MyCityCouncil.Application.Features.Parties;
using MyCityCouncil.Application.Features.Parties.Create;
using MyCityCouncil.Application.Features.Parties.Delete;
using MyCityCouncil.Application.Features.Parties.GetAll.GetAllParties;
using MyCityCouncil.Application.Features.Parties.GetAll.GetAllUserParties;
using MyCityCouncil.Application.Features.Parties.GetById;
using MyCityCouncil.Application.Features.Parties.Members.AddMember;
using MyCityCouncil.Application.Features.Parties.Members.DismissMember;

namespace MyCityCouncil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PartiesController : ControllerBase
{
    private readonly IMediator _mediator;
    
    public PartiesController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreatePartyCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetAll), new { id });
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeletePartyCommand(id), ct);
        return NoContent();
    }
    [HttpPost("{partyId}/members")]
    [ProducesResponseType(typeof(MembershipJoinDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MembershipJoinDto>> AddMember(
        Guid partyId,
        [FromBody] AddPartyMemberRequest request,
        CancellationToken ct)
    {
        var command = new AddMemberCommand(partyId, request.UserId);
        var result = await _mediator.Send(command, ct);
        
        return CreatedAtAction(
            nameof(GetMember),
            new { partyId, userId = result.UserId },
            result
        );
    }

    [HttpDelete("{id}/members/{userId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Leave(Guid id, Guid userId, CancellationToken ct)
    {
        await _mediator.Send(new DismissMemberCommand(id, userId), ct);
        return NoContent();
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<PartyDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllPartiesQuery(), ct);
        return Ok(result);
    }
    
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(PartyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        try
        {
            var result = await _mediator.Send(new GetPartyByIdQuery(id), ct);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("user/{userId:guid}")]
    [ProducesResponseType(typeof(List<PartyDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserParties(Guid userId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllUserPartiesQuery(userId), ct);
        return Ok(result);
    }
    
    [HttpGet("{partyId}/members/{userId}")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public ActionResult<MembershipJoinDto> GetMember(Guid partyId, Guid userId) =>
        NotFound();
}

public record AddMemberRequest(Guid UserId);

