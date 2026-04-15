using GymXP.Application.DTOs.Responses;

namespace GymXP.Application.Interfaces;

/// <summary>Manages XP points for users.</summary>
public interface IXPService
{
    Task<XPSummaryResponse> GetXPSummaryAsync(Guid userId);
    Task<XPSummaryResponse> AwardXPAsync(Guid userId, int points, string reason, Guid? workoutId = null);
}
