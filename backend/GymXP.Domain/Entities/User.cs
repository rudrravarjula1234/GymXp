using GymXP.Domain.Common;

namespace GymXP.Domain.Entities;

/// <summary>Represents an authenticated user in the system.</summary>
public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;

    // Navigation properties
    public UserProfile? Profile { get; set; }
    public ICollection<Workout> Workouts { get; set; } = new List<Workout>();
    public ICollection<XPRecord> XPRecords { get; set; } = new List<XPRecord>();
    public Streak? Streak { get; set; }
}
