using GymXP.Application.DTOs.Responses;
using GymXP.Application.Interfaces;
using GymXP.Domain.Entities;
using GymXP.Infrastructure.Repositories;

namespace GymXP.Application.Services;

/// <summary>Provides ranked leaderboard data based on total XP.</summary>
public class LeaderboardService : ILeaderboardService
{
    private readonly IRepository<Streak> _streakRepository;
    private readonly IRepository<User> _userRepository;

    public LeaderboardService(IRepository<Streak> streakRepository, IRepository<User> userRepository)
    {
        _streakRepository = streakRepository;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<LeaderboardEntryResponse>> GetWeeklyLeaderboardAsync(int top = 10)
    {
        var streaks = await _streakRepository.FindAsync(_ => true);
        var users = await _userRepository.FindAsync(_ => true);

        var userMap = users.ToDictionary(u => u.Id);

        return streaks
            .Where(s => userMap.ContainsKey(s.UserId))
            .OrderByDescending(s => s.TotalXP)
            .Take(top)
            .Select((s, i) => new LeaderboardEntryResponse
            {
                Rank = i + 1,
                UserId = s.UserId,
                Username = userMap[s.UserId].Username,
                TotalXP = s.TotalXP,
                Level = s.Level,
                CurrentStreak = s.CurrentStreak
            });
    }

    public async Task<LeaderboardEntryResponse?> GetUserRankAsync(Guid userId)
    {
        var allEntries = (await GetWeeklyLeaderboardAsync(int.MaxValue)).ToList();
        return allEntries.FirstOrDefault(e => e.UserId == userId);
    }
}
