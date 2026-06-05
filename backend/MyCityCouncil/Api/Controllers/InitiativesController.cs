using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using MyCityCouncil.Application.Features.Initiatives;
using MyCityCouncil.Application.Features.Initiatives.Create;
using MyCityCouncil.Application.Features.Initiatives.GetAllByStatus;
using MyCityCouncil.Application.Features.Initiatives.Review;

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
            return Unauthorized(new { error = "Ошибка авторизации" });

        var command = new CreateInitiativeCommand(
            request.Title, 
            request.Description, 
            userId, 
            request.CommitteeId
        );

        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
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
    public async Task<ActionResult<InitiativeDto>> Review(Guid id, [FromBody] ReviewInitiativeCommand request, CancellationToken ct)
    {
        var adminIdClaim = User.FindFirstValue("userId") 
                           ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(adminIdClaim) || !Guid.TryParse(adminIdClaim, out var adminId))
            return Unauthorized(new { error = "Некорректный токен авторизации" });

        var command = new ReviewInitiativeCommand(id, request.IsApproved, adminId);
        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public ActionResult GetById(Guid id) => NotFound();
}