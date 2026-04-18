using Temporalio.Workflows;
using GymXP.Workflows.Activities;

namespace GymXP.Workflows.Workflows;

/// <summary>Temporal workflow that awards XP to a user after workout completion.</summary>
[Workflow]
public class XPUpdateWorkflow
{
    [WorkflowRun]
    public async Task RunAsync(Guid userId, int points, string reason, Guid? workoutId)
    {
        await Workflow.ExecuteActivityAsync(
            (WorkoutActivities a) => a.AwardXPAsync(userId, points, reason, workoutId),
            new ActivityOptions { StartToCloseTimeout = TimeSpan.FromMinutes(2) });
    }
}
