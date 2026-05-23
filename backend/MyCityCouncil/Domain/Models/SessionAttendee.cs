namespace MyCityCouncil.Domain.Models;

public class SessionAttendee
{
    public Guid Id { get; set; }
    
    public Guid SessionId { get; set; }
    public Session Session { get; set; } = null!;
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public DateTime JoinedAt { get; set; }
}