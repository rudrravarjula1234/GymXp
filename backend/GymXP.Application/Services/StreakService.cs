using GymXP.Application.DTOs.Responses;
using GymXP.Application.Interfaces;
using GymXP.Domain.Entities;
using GymXP.Infrastructure.Repositories;

namespace GymXP.Application.Services;

/// <summary>Updates and retrieves user streaks based on daily activity.</summary>
public class StreakService : IStreakService
{
    private readonly IRepository<Streak> _streakRepository;

    public StreakService(IRepository<Streak> streakRepository)
    {
        _streakRepository = streakRepository;
    }

    public async Task<StreakResponse> GetStreakAsync(Guid userId)
    {
        var streaks = await _streakRepository.FindAsync(s => s.UserId == userId);
        var streak = streaks.FirstOrDefault() ?? new Streak { UserId = userId };
        return MapToResponse(streak);
    }

    public async Task<StreakResponse> UpdateStreakAsync(Guid userId)
    {
        var streaks = await _streakRepository.FindAsync(s => s.UserId == userId);
        var streak = streaks.FirstOrDefault();

        if (streak == null)
        {
            streak = new Streak { UserId = userId };
            await _streakRepository.AddAsync(streak);
        }

        var today = DateTime.UtcNow.Date;

        if (streak.LastActivityDate.HasValue)
        {
            var lastDate = streak.LastActivityDate.Value.Date;

            if (lastDate == today)
            {
                // Already active today – no change
                return MapToResponse(streak);
            }

            if (lastDate == today.AddDays(-1))
            {
                // Consecutive day
                streak.CurrentStreak++;
            }
            else
            {
                // Streak broken
                streak.CurrentStreak = 1;
            }
        }
        else
        {
            streak.CurrentStreak = 1;
        }

        streak.LastActivityDate = DateTime.UtcNow;
        streak.LongestStreak = Math.Max(streak.LongestStreak, streak.CurrentStreak);
        streak.UpdatedAt = DateTime.UtcNow;

        await _streakRepository.SaveChangesAsync();

        return MapToResponse(streak);
    }

    private static StreakResponse MapToResponse(Streak streak) => new()
    {
        UserId = streak.UserId,
        CurrentStreak = streak.CurrentStreak,
        LongestStreak = streak.LongestStreak,
        LastActivityDate = streak.LastActivityDate,
        IsActiveToday = streak.LastActivityDate?.Date == DateTime.UtcNow.Date
    };
}
