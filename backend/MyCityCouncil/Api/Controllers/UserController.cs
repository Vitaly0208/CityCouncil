using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using MyCityCouncil.Application.Features.UsersS.GetProfile;
using System.Security.Claims;
using MyCityCouncil.Application.Features.UsersS.GetByCommittee;
using MyCityCouncil.Application.Features.UsersS.GetUsers;
using MyCityCouncil.Application.Features.UsersS.UpdateProfile;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator) => _mediator = mediator;
    

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileDto>> GetProfile(Guid id, CancellationToken ct)
    {
        var query = new GetUserProfileQuery(id);
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }
    
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserProfileDto>> GetMyProfile(CancellationToken ct)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var query = new GetUserProfileQuery(userId);
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }
    
    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<User>))]
    public async Task<IActionResult> GetAll([FromQuery] string? role, [FromQuery] string? search, CancellationToken ct)
    {
        var users = await _mediator.Send(new GetUsersQuery(role, search), ct);
        return Ok(users);
    }

    [HttpGet("by-committee/{committeeId}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<User>))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByCommittee(Guid committeeId, CancellationToken ct)
    {
        var users = await _mediator.Send(new GetUsersByCommitteeQuery(committeeId), ct);
        return Ok(users);
    }
    
    
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(UpdateProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] UpdateProfileCommand command, CancellationToken ct)
    {
        var secureCommand = command with { UserId = id };
        var result = await _mediator.Send(secureCommand, ct);
        return Ok(result);
    }
}