namespace MyCityCouncil.Application.Features.Sessions.Finalize;

public record FinalizeSessionResult(bool Success, Guid? NextSessionId);