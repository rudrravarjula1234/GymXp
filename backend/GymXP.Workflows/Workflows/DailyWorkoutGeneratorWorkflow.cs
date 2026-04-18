using Temporalio.Workflows;
using GymXP.Workflows.Activities;

namespace GymXP.Workflows.Workflows;

/// <summary>
/// Temporal workflow that generates a daily workout for a user.
/// Intended to be triggered on a schedule (e.g. every morning).
/// </summary>
[Workflow]
public class DailyWorkoutGeneratorWorkflow
{
    [WorkflowRun]
    public async Task<string> RunAsync(Guid userId)
    {
        var workoutId = await Workflow.ExecuteActivityAsync(
            (WorkoutActivities a) => a.GenerateDailyWorkoutAsync(userId),
            new ActivityOptions { StartToCloseTimeout = TimeSpan.FromMinutes(5) });

        return workoutId;
    }
}
