using GymXP.Application.DTOs.Requests;
using GymXP.Application.DTOs.Responses;
using GymXP.Application.Interfaces;
using GymXP.Domain.Entities;
using GymXP.Infrastructure.Repositories;

namespace GymXP.Application.Services;

/// <summary>Manages user profile creation and retrieval.</summary>
public class UserProfileService : IUserProfileService
{
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<UserProfile> _profileRepository;
    private readonly IRepository<Streak> _streakRepository;

    public UserProfileService(
        IRepository<User> userRepository,
        IRepository<UserProfile> profileRepository,
        IRepository<Streak> streakRepository)
    {
        _userRepository = userRepository;
        _profileRepository = profileRepository;
        _streakRepository = streakRepository;
    }

    public async Task<UserProfileResponse?> GetProfileAsync(Guid userId)
    {
        var users = await _userRepository.FindAsync(u => u.Id == userId);
        var user = users.FirstOrDefault();
        if (user == null) return null;

        var profiles = await _profileRepository.FindAsync(p => p.UserId == userId);
        var profile = profiles.FirstOrDefault();

        var streaks = await _streakRepository.FindAsync(s => s.UserId == userId);
        var streak = streaks.FirstOrDefault();

        return MapToResponse(user, profile, streak);
    }

    public async Task<UserProfileResponse> CreateOrUpdateProfileAsync(Guid userId, UpsertUserProfileRequest request)
    {
        var users = await _userRepository.FindAsync(u => u.Id == userId);
        var user = users.FirstOrDefault() ?? throw new KeyNotFoundException("User not found.");

        var profiles = await _profileRepository.FindAsync(p => p.UserId == userId);
        var profile = profiles.FirstOrDefault();

        if (profile == null)
        {
            profile = new UserProfile { UserId = userId };
            await _profileRepository.AddAsync(profile);
        }

        profile.WeightKg = request.WeightKg;
        profile.HeightCm = request.HeightCm;
        profile.AgeYears = request.AgeYears;
        profile.Goal = request.Goal;
        profile.ExperienceLevel = request.ExperienceLevel;
        profile.AvailableEquipment = request.AvailableEquipment;
        profile.AvailableTimeMinutes = request.AvailableTimeMinutes;
        profile.UpdatedAt = DateTime.UtcNow;

        await _profileRepository.SaveChangesAsync();

        var streaks = await _streakRepository.FindAsync(s => s.UserId == userId);
        var streak = streaks.FirstOrDefault();

        return MapToResponse(user, profile, streak)!;
    }

    private static UserProfileResponse? MapToResponse(User user, UserProfile? profile, Streak? streak)
    {
        return new UserProfileResponse
        {
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            WeightKg = profile?.WeightKg ?? 0,
            HeightCm = profile?.HeightCm ?? 0,
            AgeYears = profile?.AgeYears ?? 0,
            Goal = profile?.Goal.ToString() ?? string.Empty,
            ExperienceLevel = profile?.ExperienceLevel.ToString() ?? string.Empty,
            AvailableEquipment = profile?.AvailableEquipment ?? string.Empty,
            AvailableTimeMinutes = profile?.AvailableTimeMinutes ?? 45,
            TotalXP = streak?.TotalXP ?? 0,
            Level = streak?.Level ?? 1,
            CurrentStreak = streak?.CurrentStreak ?? 0
        };
    }
}
