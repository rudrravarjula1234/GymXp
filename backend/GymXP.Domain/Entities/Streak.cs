using GymXP.Domain.Common;

namespace GymXP.Domain.Entities;

/// <summary>Tracks the daily workout streak for a user.</summary>
public class Streak : BaseEntity
{
    public Guid UserId { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime? LastActivityDate { get; set; }
    public int TotalXP { get; set; }
    public int Level { get; set; } = 1;

    // Navigation property
    public User User { get; set; } = null!;
}
