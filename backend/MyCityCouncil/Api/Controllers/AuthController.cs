using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyCityCouncil.Application.Features.Auth.Login;
using MyCityCouncil.Application.Features.Auth.Logout;
using MyCityCouncil.Application.Features.Auth.RefreshToken;
using MyCityCouncil.Application.Features.Auth.Register;

namespace MyCityCouncil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    
    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }
    
    [HttpPost("register")]
    public async Task<ActionResult<RegisterDto>> Register([FromBody] RegisterCommand command, CancellationToken token)
    {
        var result = await _mediator.Send(command, token);
        return Ok(result);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginDto>> Login([FromBody] LoginCommand command, CancellationToken token)
    {
        var result = await _mediator.Send(command, token);
        return Ok(result);
    }
    
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var userIdClaim = User.FindFirstValue("userId");
        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User ID claim not found");

        var userId = Guid.Parse(userIdClaim);
        await _mediator.Send(new LogoutCommand { UserId = userId }, ct);
        return NoContent(); 
    }
    
    [HttpPost("refresh")]
    public async Task<ActionResult<RefreshTokenDto>> Refresh([FromBody] RefreshTokenCommand command, CancellationToken token)
    {
        var res = await _mediator.Send(command, token);
        return Ok(res);
    }
}