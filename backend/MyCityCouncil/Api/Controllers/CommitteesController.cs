using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using MyCityCouncil.Application.Features.Committees.Create;
using MyCityCouncil.Application.Features.Committees.GetDetails;

using MyCityCouncil.Application.Features.Committees.Members;
using MyCityCouncil.Application.Features.Committees.Members.AddMember;
using MyCityCouncil.Application.Features.Committees.Members.AppointChairman;
using MyCityCouncil.Application.Features.Committees.Members.Dismiss;


namespace MyCityCouncil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // По умолчанию требуем авторизацию. Публичные методы помечены [AllowAnonymous]
public class CommitteesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CommitteesController(IMediator mediator) => _mediator = mediator;


    /// <summary>
    /// Получить детальную информацию о комиссии: профиль, текущий состав, история за 10 лет
    /// </summary>
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

    /// <summary>
    /// Создать новую комиссию
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(CreateCommitteeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateCommitteeDto>> Create([FromBody] CreateCommitteeCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetDetails), new { id = result.Id }, result);
    }

    /// <summary>
    /// Обновить профиль комиссии (название, специализация, описание)
    /// </summary>

    /// <summary>
    /// Добавить рядового члена в комиссию
    /// </summary>
    [HttpPost("{id}/members")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(MembershipDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MembershipDto>> AddMember(Guid id, [FromBody] AddMemberCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command with { CommitteeId = id }, ct);
        return CreatedAtAction(nameof(GetMember), new { committeeId = id, userId = result.UserId }, result);
    }

    /// <summary>
    /// Назначить председателя комиссии (пользователь уже должен быть активным членом)
    /// </summary>
    [HttpPost("{id}/chairman")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(MembershipDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MembershipDto>> AppointChairman(Guid id, [FromBody] AppointChairmanCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command with { CommitteeId = id }, ct);
        return Ok(result);
    }
    /// <summary>
    /// Уволить пользователя из комиссии (снимает флаг председателя, если он был)
    /// </summary>
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

    /// <summary>
    /// Вспомогательный эндпоинт для получения конкретного членства (для CreatedAtAction)
    /// </summary>
    [HttpGet("{committeeId}/members/{userId}")]
    [ApiExplorerSettings(IgnoreApi = true)] // Скрыт из Swagger, используется только для генерации ссылок
    public ActionResult<MembershipDto> GetMember(Guid committeeId, Guid userId) => 
        NotFound();
}