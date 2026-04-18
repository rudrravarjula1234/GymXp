using GymXP.Application.DTOs.Responses;
using GymXP.Application.Interfaces;
using GymXP.Domain.Entities;
using GymXP.Infrastructure.Repositories;

namespace GymXP.Application.Services;

/// <summary>Awards and tracks XP for users, computing level progression.</summary>
public class XPService : IXPService
{
    private readonly IRepository<XPRecord> _xpRepository;
    private readonly IRepository<Streak> _streakRepository;

    // XP thresholds: level N requires N * 500 total XP
    private const int XpPerLevel = 500;

    public XPService(IRepository<XPRecord> xpRepository, IRepository<Streak> streakRepository)
    {
        _xpRepository = xpRepository;
        _streakRepository = streakRepository;
    }

    public async Task<XPSummaryResponse> GetXPSummaryAsync(Guid userId)
    {
        var streaks = await _streakRepository.FindAsync(s => s.UserId == userId);
        var streak = streaks.FirstOrDefault() ?? new Streak { UserId = userId };

        var records = await _xpRepository.FindAsync(r => r.UserId == userId);
        var recent = records.OrderByDescending(r => r.CreatedAt).Take(10).ToList();

        return BuildSummary(userId, streak.TotalXP, streak.Level, recent);
    }

    public async Task<XPSummaryResponse> AwardXPAsync(Guid userId, int points, string reason, Guid? workoutId = null)
    {
        // Record the XP transaction
        var record = new XPRecord
        {
            UserId = userId,
            PointsEarned = points,
            Reason = reason,
            WorkoutId = workoutId
        };
        await _xpRepository.AddAsync(record);

        // Update aggregate on Streak entity
        var streaks = await _streakRepository.FindAsync(s => s.UserId == userId);
        var streak = streaks.FirstOrDefault();

        if (streak == null)
        {
            streak = new Streak { UserId = userId };
            await _streakRepository.AddAsync(streak);
        }

        streak.TotalXP += points;
        streak.Level = CalculateLevel(streak.TotalXP);
        streak.UpdatedAt = DateTime.UtcNow;

        await _streakRepository.SaveChangesAsync();

        var records = await _xpRepository.FindAsync(r => r.UserId == userId);
        var recent = records.OrderByDescending(r => r.CreatedAt).Take(10).ToList();

        return BuildSummary(userId, streak.TotalXP, streak.Level, recent);
    }

    // ---------- helpers ----------

    private static int CalculateLevel(int totalXP) => Math.Max(1, totalXP / XpPerLevel + 1);

    private static XPSummaryResponse BuildSummary(Guid userId, int totalXP, int level, List<XPRecord> recent)
    {
        int xpForCurrentLevel = (level - 1) * XpPerLevel;
        int xpRequiredForNextLevel = level * XpPerLevel;
        int xpInCurrentLevel = totalXP - xpForCurrentLevel;
        int xpNeeded = xpRequiredForNextLevel - xpForCurrentLevel;

        return new XPSummaryResponse
        {
            UserId = userId,
            TotalXP = totalXP,
            Level = level,
            XPForCurrentLevel = xpForCurrentLevel,
            XPRequiredForNextLevel = xpRequiredForNextLevel,
            ProgressToNextLevel = xpNeeded > 0 ? (float)xpInCurrentLevel / xpNeeded : 1f,
            RecentRecords = recent.Select(r => new XPRecordResponse
            {
                PointsEarned = r.PointsEarned,
                Reason = r.Reason,
                EarnedAt = r.CreatedAt
            }).ToList()
        };
    }
}
