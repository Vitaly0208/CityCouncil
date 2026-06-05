using MediatR;
using MyCityCouncil.Application.Features.Voting.CastVote;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Sessions.LeaveSession;

public class LeaveSessionHandler : IRequestHandler<LeaveSessionCommand, Unit>
{
    private readonly ISessionAttendeeRepository _attendeeRepo;
    private readonly ILogger<LeaveSessionHandler> _logger;

    public LeaveSessionHandler(ISessionAttendeeRepository attendeeRepo,  ILogger<LeaveSessionHandler> logger)
    {
        _attendeeRepo = attendeeRepo;
        _logger = logger;
    }

    public async Task<Unit> Handle(LeaveSessionCommand request, CancellationToken ct)
    {
        await _attendeeRepo.SetAttendanceStatusAsync(request.SessionId, request.UserId, false, ct);
        _logger.LogInformation("ВЫХОД С ЗАСЕДАНИЯ: UserId={UserId} покинул SessionId={SessionId}", 
            request.UserId, request.SessionId);
        
        return Unit.Value;
    }
}