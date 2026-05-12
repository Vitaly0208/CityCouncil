using System.Text.Json.Serialization;

namespace MyCityCouncil.Domain.Models;

public class Party
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Abbreviation { get; set; }
    public string? Ideology { get; set; }
    
    [JsonIgnore]
    public List<PartiesInfo> Memberships { get; set; } = new();
}