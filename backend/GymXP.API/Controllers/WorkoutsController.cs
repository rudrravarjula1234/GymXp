using System.Security.Claims;
using GymXP.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymXP.API.Controllers;

[ApiController]
[Route("api/workouts")]
[Authorize]
public class WorkoutsController : ControllerBase
{
    private readonly IWorkoutService _workoutService;

    public WorkoutsController(IWorkoutService workoutService) => _workoutService = workoutService;

    /// <summary>Get today's workout for the authenticated user.</summary>
    [HttpGet("today")]
    public async Task<IActionResult> GetTodayWorkout()
    {
        var userId = GetUserId();
        var workout = await _workoutService.GetTodayWorkoutAsync(userId);
        if (workout == null) return NotFound(new { message = "No workout scheduled for today. Generate one first." });
        return Ok(workout);
    }

    /// <summary>Get workout history for the authenticated user.</summary>
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();
        var workouts = await _workoutService.GetWorkoutHistoryAsync(userId, page, pageSize);
        return Ok(workouts);
    }

    /// <summary>Generate a new AI workout for today.</summary>
    [HttpPost("generate")]
    public async Task<IActionResult> GenerateWorkout()
    {
        var userId = GetUserId();
        try
        {
            var workout = await _workoutService.GenerateDailyWorkoutAsync(userId);
            return Ok(workout);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Mark a workout as completed and award XP.</summary>
    [HttpPost("{workoutId:guid}/complete")]
    public async Task<IActionResult> CompleteWorkout(Guid workoutId)
    {
        var userId = GetUserId();
        try
        {
            var workout = await _workoutService.CompleteWorkoutAsync(userId, workoutId);
            return Ok(workout);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Workout not found." });
        }
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
