using Temporalio.Workflows;
using GymXP.Workflows.Activities;

namespace GymXP.Workflows.Workflows;

/// <summary>Temporal workflow that updates a user's streak after daily activity.</summary>
[Workflow]
public class StreakTrackingWorkflow
{
    [WorkflowRun]
    public async Task RunAsync(Guid userId)
    {
        await Workflow.ExecuteActivityAsync(
            (WorkoutActivities a) => a.UpdateStreakAsync(userId),
            new ActivityOptions { StartToCloseTimeout = TimeSpan.FromMinutes(2) });
    }
}
