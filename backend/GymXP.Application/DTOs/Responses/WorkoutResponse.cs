using GymXP.Domain.Enums;

namespace GymXP.Application.DTOs.Responses;

public class WorkoutResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string MotivationMessage { get; set; } = string.Empty;
    public DateTime ScheduledDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int XPReward { get; set; }
    public List<ExerciseResponse> Exercises { get; set; } = new();
}

public class ExerciseResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Sets { get; set; }
    public int Reps { get; set; }
    public int DurationSeconds { get; set; }
    public string MuscleGroup { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
}
