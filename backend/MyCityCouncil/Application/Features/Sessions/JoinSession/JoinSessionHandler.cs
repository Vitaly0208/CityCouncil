using MediatR;
using MyCityCouncil.Application.Interfaces;
using MyCityCouncil.Domain.Interfaces;
using MyCityCouncil.Domain.Models;

namespace MyCityCouncil.Application.Features.Sessions.JoinSession;

public class JoinSessionHandler : IRequestHandler<JoinSessionCommand, Unit>
{
    private readonly ISessionRepository _sessionRepository;
    private readonly ISessionAttendeeRepository _attendeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public JoinSessionHandler(
        ISessionRepository sessionRepository,
        ISessionAttendeeRepository attendeeRepository,
        IUnitOfWork unitOfWork)
    {
        _sessionRepository = sessionRepository;
        _attendeeRepository = attendeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(JoinSessionCommand request, CancellationToken ct)
    {
        var session = await _sessionRepository.GetByIdAsync(request.SessionId, ct);
        if (session == null)
            throw new InvalidOperationException("Заседание не найдено");
        
        if (session.IsCompleted)
            throw new InvalidOperationException("Нельзя присоединиться к завершенному заседанию");
        
        var isAttending = await _attendeeRepository.IsUserAttendingAsync(
            request.SessionId, 
            request.UserId, 
            ct);

        if (isAttending)
            return Unit.Value;
        
        var attendee = new SessionAttendee
        {
            Id = Guid.NewGuid(),
            SessionId = request.SessionId,
            UserId = request.UserId,
            JoinedAt = DateTime.UtcNow
        };

        await _attendeeRepository.AddAsync(attendee, ct);
        await _unitOfWork.SaveAsync(ct);

        return Unit.Value;
    }
}