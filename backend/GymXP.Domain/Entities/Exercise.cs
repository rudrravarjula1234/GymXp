using GymXP.Domain.Common;

namespace GymXP.Domain.Entities;

/// <summary>A single exercise within a workout.</summary>
public class Exercise : BaseEntity
{
    public Guid WorkoutId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Sets { get; set; }
    public int Reps { get; set; }
    public int DurationSeconds { get; set; }
    public string MuscleGroup { get; set; } = string.Empty;
    public int OrderIndex { get; set; }

    // Navigation property
    public Workout Workout { get; set; } = null!;
}
