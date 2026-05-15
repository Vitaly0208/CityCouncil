using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using MyCityCouncil.Application.Features.UsersS.GetProfile;
using System.Security.Claims;

namespace MyCityCouncil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator) => _mediator = mediator;
    
    
    /// <summary>
    /// Получить профиль пользователя по ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileDto>> GetProfile(Guid id, CancellationToken ct)
    {
        var query = new GetUserProfileQuery(id);
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }

    /// <summary>
    /// Получить профиль текущего авторизованного пользователя
    /// </summary>
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
}