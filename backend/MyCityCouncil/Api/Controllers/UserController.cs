using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using MyCityCouncil.Application.Features.UsersS.GetProfile;
using MyCityCouncil.Application.Features.UsersS.GetAll;
using MyCityCouncil.Application.Features.UsersS.GetByCommittee;
using MyCityCouncil.Application.Features.UsersS.UpdateProfile;

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
        var result = await _mediator.Send(new GetUserProfileQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }
    
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserProfileDto>> GetMyProfile(CancellationToken ct)
    {
        var userId = GetUserIdFromToken();
        var result = await _mediator.Send(new GetUserProfileQuery(userId), ct);
        return Ok(result);
    }

    [HttpGet("by-committee/{committeeId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(List<UserSearchDto>), StatusCodes.Status200OK)] 
    public async Task<IActionResult> GetByCommittee(Guid committeeId, CancellationToken ct)
    {
        var users = await _mediator.Send(new GetUsersByCommitteeQuery(committeeId), ct);
        return Ok(users);
    }
    
    [HttpPut("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(UpdateProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] UpdateProfileCommand command, CancellationToken ct)
    {
        var currentUserId = GetUserIdFromToken();
        if (id != currentUserId && !User.IsInRole("Admin"))
        {
            return Forbid("Вы можете редактировать только свой профиль");
        }
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
    
    private Guid GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) 
                       ?? User.FindFirstValue("userId");
        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Не удалось определить пользователя из токена");
        }
        return userId;
    }
}