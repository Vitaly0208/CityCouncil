using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using MyCityCouncil.Application.Features.UsersS.GetRating;

namespace MyCityCouncil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class RatingController : ControllerBase
{
    private readonly IMediator _mediator;

    public RatingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("leaderboard")]
    [ProducesResponseType(typeof(List<UserRatingDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLeaderboard(
        [FromQuery] int limit = 10, 
        CancellationToken ct = default)
    {
        limit = Math.Clamp(limit, 1, 100);
        
        var query = new GetTopDeputiesQuery(limit);
        var result = await _mediator.Send(query, ct);
        
        return Ok(result);
    }
}