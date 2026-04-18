using System.Text.Json;
using GymXP.Application.DTOs.Responses;
using GymXP.Application.Interfaces;
using GymXP.Domain.Entities;
using GymXP.Domain.Enums;
using GymXP.Infrastructure.Repositories;

namespace GymXP.Application.Services;

/// <summary>Generates and manages workouts using AI and persists them.</summary>
public class WorkoutService : IWorkoutService
{
    private readonly IRepository<Workout> _workoutRepository;
    private readonly IRepository<UserProfile> _profileRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IAIService _aiService;
    private readonly IXPService _xpService;
    private readonly IStreakService _streakService;

    public WorkoutService(
        IRepository<Workout> workoutRepository,
        IRepository<UserProfile> profileRepository,
        IRepository<User> userRepository,
        IAIService aiService,
        IXPService xpService,
        IStreakService streakService)
    {
        _workoutRepository = workoutRepository;
        _profileRepository = profileRepository;
        _userRepository = userRepository;
        _aiService = aiService;
        _xpService = xpService;
        _streakService = streakService;
    }

    public async Task<WorkoutResponse?> GetTodayWorkoutAsync(Guid userId)
    {
        var today = DateTime.UtcNow.Date;
        var workouts = await _workoutRepository.FindAsync(
            w => w.UserId == userId && w.ScheduledDate.Date == today);
        var workout = workouts.FirstOrDefault();
        return workout == null ? null : MapToResponse(workout);
    }

    public async Task<IEnumerable<WorkoutResponse>> GetWorkoutHistoryAsync(Guid userId, int page = 1, int pageSize = 10)
    {
        var workouts = await _workoutRepository.FindAsync(w => w.UserId == userId);
        return workouts
            .OrderByDescending(w => w.ScheduledDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(MapToResponse);
    }

    public async Task<WorkoutResponse> GenerateDailyWorkoutAsync(Guid userId)
    {
        // Check if a workout already exists for today
        var today = DateTime.UtcNow.Date;
        var existing = await _workoutRepository.FindAsync(
            w => w.UserId == userId && w.ScheduledDate.Date == today);
        if (existing.Any())
            return MapToResponse(existing.First());

        // Get user profile
        var profiles = await _profileRepository.FindAsync(p => p.UserId == userId);
        var profile = profiles.FirstOrDefault()
            ?? throw new InvalidOperationException("User profile not found. Please complete your profile first.");

        var users = await _userRepository.FindAsync(u => u.Id == userId);
        var user = users.First();

        // Generate workout plan via AI
        var planJson = await _aiService.GenerateWorkoutPlanAsync(
            profile.Goal.ToString(),
            profile.AvailableEquipment,
            profile.AvailableTimeMinutes,
            profile.ExperienceLevel.ToString());

        var motivationMessage = await _aiService.GenerateMotivationMessageAsync(
            user.Username, 0, 0, profile.Goal.ToString());

        // Parse and persist
        var workout = ParseWorkoutFromJson(planJson, userId, motivationMessage);
        await _workoutRepository.AddAsync(workout);
        await _workoutRepository.SaveChangesAsync();

        return MapToResponse(workout);
    }

    public async Task<WorkoutResponse> CompleteWorkoutAsync(Guid userId, Guid workoutId)
    {
        var workouts = await _workoutRepository.FindAsync(
            w => w.Id == workoutId && w.UserId == userId);
        var workout = workouts.FirstOrDefault()
            ?? throw new KeyNotFoundException("Workout not found.");

        if (workout.Status == WorkoutStatus.Completed)
            return MapToResponse(workout);

        workout.Status = WorkoutStatus.Completed;
        workout.UpdatedAt = DateTime.UtcNow;
        await _workoutRepository.SaveChangesAsync();

        // Award XP and update streak
        await _xpService.AwardXPAsync(userId, workout.XPReward, $"Completed workout: {workout.Title}", workoutId);
        await _streakService.UpdateStreakAsync(userId);

        return MapToResponse(workout);
    }

    // ---------- helpers ----------

    private static Workout ParseWorkoutFromJson(string planJson, Guid userId, string motivationMessage)
    {
        // Try to parse AI-generated JSON; fall back to a default plan on error
        try
        {
            var doc = JsonDocument.Parse(planJson);
            var root = doc.RootElement;

            var workout = new Workout
            {
                UserId = userId,
                Title = root.TryGetProperty("title", out var t) ? t.GetString() ?? "Daily Workout" : "Daily Workout",
                Description = root.TryGetProperty("description", out var d) ? d.GetString() ?? "" : "",
                MotivationMessage = motivationMessage,
                ScheduledDate = DateTime.UtcNow.Date,
                XPReward = root.TryGetProperty("xpReward", out var xp) ? xp.GetInt32() : 100
            };

            if (root.TryGetProperty("exercises", out var exercisesEl))
            {
                int index = 0;
                foreach (var ex in exercisesEl.EnumerateArray())
                {
                    workout.Exercises.Add(new Exercise
                    {
                        Name = ex.TryGetProperty("name", out var n) ? n.GetString() ?? "" : "",
                        Description = ex.TryGetProperty("description", out var desc) ? desc.GetString() ?? "" : "",
                        Sets = ex.TryGetProperty("sets", out var s) ? s.GetInt32() : 3,
                        Reps = ex.TryGetProperty("reps", out var r) ? r.GetInt32() : 10,
                        DurationSeconds = ex.TryGetProperty("durationSeconds", out var dur) ? dur.GetInt32() : 0,
                        MuscleGroup = ex.TryGetProperty("muscleGroup", out var mg) ? mg.GetString() ?? "" : "",
                        OrderIndex = index++
                    });
                }
            }

            return workout;
        }
        catch
        {
            return BuildDefaultWorkout(userId, motivationMessage);
        }
    }

    private static Workout BuildDefaultWorkout(Guid userId, string motivationMessage)
    {
        return new Workout
        {
            UserId = userId,
            Title = "Full Body Circuit",
            Description = "A balanced full-body workout to get you moving.",
            MotivationMessage = motivationMessage,
            ScheduledDate = DateTime.UtcNow.Date,
            XPReward = 100,
            Exercises = new List<Exercise>
            {
                new() { Name = "Push-Ups", MuscleGroup = "Chest", Sets = 3, Reps = 15, OrderIndex = 0 },
                new() { Name = "Bodyweight Squats", MuscleGroup = "Legs", Sets = 3, Reps = 20, OrderIndex = 1 },
                new() { Name = "Plank", MuscleGroup = "Core", DurationSeconds = 60, Sets = 3, OrderIndex = 2 },
                new() { Name = "Lunges", MuscleGroup = "Legs", Sets = 3, Reps = 12, OrderIndex = 3 },
                new() { Name = "Burpees", MuscleGroup = "Full Body", Sets = 3, Reps = 10, OrderIndex = 4 }
            }
        };
    }

    private static WorkoutResponse MapToResponse(Workout workout) => new()
    {
        Id = workout.Id,
        Title = workout.Title,
        Description = workout.Description,
        MotivationMessage = workout.MotivationMessage,
        ScheduledDate = workout.ScheduledDate,
        Status = workout.Status.ToString(),
        XPReward = workout.XPReward,
        Exercises = workout.Exercises
            .OrderBy(e => e.OrderIndex)
            .Select(e => new ExerciseResponse
            {
                Id = e.Id,
                Name = e.Name,
                Description = e.Description,
                Sets = e.Sets,
                Reps = e.Reps,
                DurationSeconds = e.DurationSeconds,
                MuscleGroup = e.MuscleGroup,
                OrderIndex = e.OrderIndex
            }).ToList()
    };
}
