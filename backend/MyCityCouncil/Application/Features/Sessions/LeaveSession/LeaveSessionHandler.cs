using MediatR;
using MyCityCouncil.Application.Features.Sessions.LeaveSession;
using MyCityCouncil.Domain.Interfaces;

namespace MyCityCouncil.Application.Features.Sessions.Leave;

public class LeaveSessionHandler : IRequestHandler<LeaveSessionCommand, Unit>
{
    private readonly ISessionAttendeeRepository _attendeeRepo;

    public LeaveSessionHandler(ISessionAttendeeRepository attendeeRepo) =>
        _attendeeRepo = attendeeRepo;

    public async Task<Unit> Handle(LeaveSessionCommand request, CancellationToken ct)
    {
        await _attendeeRepo.SetAttendanceStatusAsync(request.SessionId, request.UserId, false, ct);
        return Unit.Value;
    }
}