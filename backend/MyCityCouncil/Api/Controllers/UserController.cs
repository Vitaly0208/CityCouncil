using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using MyCityCouncil.Application.Features.UsersS.GetProfile;
using System.Security.Claims;
using MyCityCouncil.Application.Features.UsersS.GetAll;
using MyCityCouncil.Application.Features.UsersS.GetByCommittee;
using MyCityCouncil.Application.Features.UsersS.UpdateProfile;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator) => _mediator = mediator;
    

    [HttpGet("{id:guid}")]
    [AllowAnonymous] 
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileDto>> GetProfile(Guid id, CancellationToken ct)
    {
        var query = new GetUserProfileQuery(id);
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }
    
    [HttpGet("me")]
    [Authorize]
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
    
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(List<UserSearchDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? searchTerm,
        [FromQuery] string? role,
        [FromQuery] Guid? committeeId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var query = new GetAllUsersQuery(
            SearchTerm: searchTerm,
            Role: role,
            CommitteeId: committeeId,
            Page: page,
            PageSize: pageSize
        );
    
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }
}