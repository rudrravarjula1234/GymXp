using GymXP.Domain.Common;
using GymXP.Domain.Enums;

namespace GymXP.Domain.Entities;

/// <summary>Represents a workout session generated for a user.</summary>
public class Workout : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    /// <summary>AI-generated motivation message for this workout.</summary>
    public string MotivationMessage { get; set; } = string.Empty;

    public DateTime ScheduledDate { get; set; }
    public WorkoutStatus Status { get; set; } = WorkoutStatus.Pending;

    /// <summary>XP awarded upon completion.</summary>
    public int XPReward { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();
}
