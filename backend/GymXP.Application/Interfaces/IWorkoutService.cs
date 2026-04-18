using GymXP.Application.DTOs.Requests;
using GymXP.Application.DTOs.Responses;

namespace GymXP.Application.Interfaces;

/// <summary>Manages workout generation and completion.</summary>
public interface IWorkoutService
{
    Task<WorkoutResponse?> GetTodayWorkoutAsync(Guid userId);
    Task<IEnumerable<WorkoutResponse>> GetWorkoutHistoryAsync(Guid userId, int page = 1, int pageSize = 10);
    Task<WorkoutResponse> GenerateDailyWorkoutAsync(Guid userId);
    Task<WorkoutResponse> CompleteWorkoutAsync(Guid userId, Guid workoutId);
}
