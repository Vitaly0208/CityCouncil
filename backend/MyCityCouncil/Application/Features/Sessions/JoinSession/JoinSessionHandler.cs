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
    private readonly IUserRepository _userRepository;
    private readonly ILogger<JoinSessionHandler> _logger;

    public JoinSessionHandler(
        ISessionRepository sessionRepository,
        ISessionAttendeeRepository attendeeRepository,
        IUnitOfWork unitOfWork,
        IUserRepository userRepository,
        ILogger<JoinSessionHandler> logger)
    {
        _sessionRepository = sessionRepository;
        _attendeeRepository = attendeeRepository;
        _unitOfWork = unitOfWork;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<Unit> Handle(JoinSessionCommand request, CancellationToken ct)
    {
        var session = await _sessionRepository.GetByIdAsync(request.SessionId, ct)
            ?? throw new KeyNotFoundException("Заседание не найдено");
        
        if (session.IsCompleted)
            throw new InvalidOperationException("Нельзя присоединиться к завершенному заседанию");
        
        if (session.HeldAt < DateTime.UtcNow && !session.IsCompleted)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId, ct)
                       ?? throw new KeyNotFoundException("Пользователь не найден");
            
            if (user.Role?.Name != "Admin")
                throw new InvalidOperationException(
                    "Заседание уже было в указанную дату, но не было завершено. Простите за неудобство!"
                );
        }
        
        var isAttending = await _attendeeRepository.IsUserAttendingAsync(
            request.SessionId, 
            request.UserId, 
            ct);

        if (isAttending)
        {
            await _attendeeRepository.SetAttendanceStatusAsync(request.SessionId, request.UserId, true, ct);
            return Unit.Value;
        }
        
        var attendee = new SessionAttendee
        {
            Id = Guid.NewGuid(),
            SessionId = request.SessionId,
            UserId = request.UserId,
            IsCurrentlyOnSession = true,
            JoinedAt = DateTime.UtcNow
        };

        await _attendeeRepository.AddAsync(attendee, ct);
        await _unitOfWork.SaveAsync(ct);
        _logger.LogInformation("ПОСЕЩЕНИЕ ЗАСЕДАНИЯ: UserId={UserId} присоединился к SessionId={SessionId}", 
            request.UserId, request.SessionId);

        return Unit.Value;
    }
}