using GymXP.Application.DTOs.Responses;

namespace GymXP.Application.Interfaces;

/// <summary>Tracks and updates user streaks.</summary>
public interface IStreakService
{
    Task<StreakResponse> GetStreakAsync(Guid userId);
    Task<StreakResponse> UpdateStreakAsync(Guid userId);
}
