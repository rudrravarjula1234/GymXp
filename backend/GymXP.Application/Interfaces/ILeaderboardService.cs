using GymXP.Application.DTOs.Responses;

namespace GymXP.Application.Interfaces;

/// <summary>Provides leaderboard data.</summary>
public interface ILeaderboardService
{
    Task<IEnumerable<LeaderboardEntryResponse>> GetWeeklyLeaderboardAsync(int top = 10);
    Task<LeaderboardEntryResponse?> GetUserRankAsync(Guid userId);
}
