using System.Text.Json.Serialization;

namespace MyCityCouncil.Domain.Models;

public class Committee
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ArchivedAt { get; set; }
    
    [JsonIgnore]
    public List<CommitteeInfo> Memberships { get; set; } = new();
}