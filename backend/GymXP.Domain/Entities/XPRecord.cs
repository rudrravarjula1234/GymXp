using GymXP.Domain.Common;

namespace GymXP.Domain.Entities;

/// <summary>Records an XP earning event for a user.</summary>
public class XPRecord : BaseEntity
{
    public Guid UserId { get; set; }
    public int PointsEarned { get; set; }
    public string Reason { get; set; } = string.Empty;
    public Guid? WorkoutId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Workout? Workout { get; set; }
}
