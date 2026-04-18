using Temporalio.Activities;
using GymXP.Application.Interfaces;

namespace GymXP.Workflows.Activities;

/// <summary>Temporal activity implementations for workout-related operations.</summary>
public class WorkoutActivities
{
    private readonly IWorkoutService _workoutService;
    private readonly IXPService _xpService;
    private readonly IStreakService _streakService;

    public WorkoutActivities(IWorkoutService workoutService, IXPService xpService, IStreakService streakService)
    {
        _workoutService = workoutService;
        _xpService = xpService;
        _streakService = streakService;
    }

    [Activity]
    public async Task<string> GenerateDailyWorkoutAsync(Guid userId)
    {
        var workout = await _workoutService.GenerateDailyWorkoutAsync(userId);
        return workout.Id.ToString();
    }

    [Activity]
    public async Task AwardXPAsync(Guid userId, int points, string reason, Guid? workoutId = null)
    {
        await _xpService.AwardXPAsync(userId, points, reason, workoutId);
    }

    [Activity]
    public async Task UpdateStreakAsync(Guid userId)
    {
        await _streakService.UpdateStreakAsync(userId);
    }
}
