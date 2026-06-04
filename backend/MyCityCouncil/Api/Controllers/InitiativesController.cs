
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;

using MyCityCouncil.Application.Features.Initiatives;
using MyCityCouncil.Application.Features.Initiatives.Create;
using MyCityCouncil.Application.Features.Initiatives.GetAllByStatus;
using MyCityCouncil.Application.Features.Initiatives.Review;
using MyCityCouncil.Domain.Enums;


namespace MyCityCouncil.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
public class InitiativesController : ControllerBase
{
    private readonly IMediator _mediator;

    public InitiativesController(IMediator mediator)
    {
        _mediator = mediator;
    }
    
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? searchTerm,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var query = new GetAllInitiativesByStatusQuery(
            Status: status,
            SearchTerm: searchTerm,
            PageSize: pageSize
        );
    
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }
    
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(CreateInitiativeResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CreateInitiativeResponseDto>> Create(
        [FromBody] CreateInitiativeRequest request, 
        CancellationToken ct)
    {
        var userIdClaim = User.FindFirstValue("userId") 
                          ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Ошибка авторизации" });
        }
        var command = new CreateInitiativeCommand(
            request.Title, 
            request.Description, 
            userId, 
            request.CommitteeId
        );
        try
        {
            var result = await _mediator.Send(command, ct);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Внутренняя ошибка: {ex.Message}" });
        }
    }
    public record CreateInitiativeRequest(
        string Title,
        string Description,
        Guid? CommitteeId
    );
    
    [HttpPut("{id}/review")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(InitiativeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<InitiativeDto>> Review(Guid id, [FromBody] ReviewInitiativeCommand request, CancellationToken ct)
    {
        var adminIdClaim = User.FindFirstValue("userId") 
                           ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(adminIdClaim) || !Guid.TryParse(adminIdClaim, out var adminId))
        {
            return BadRequest(new { message = "Некорректный токен авторизации." });
        }
        
        var command = new ReviewInitiativeCommand(id, request.IsApproved, adminId);

        try
        {
            var result = await _mediator.Send(command, ct);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Внутренняя ошибка сервера." });
        }
    }


    [HttpGet("{id}")]
    [AllowAnonymous]
    public ActionResult GetById(Guid id) => NotFound();
}
