using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using GymXP.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GymXP.Application.Services;

/// <summary>
/// AI service that calls an OpenAI-compatible chat completion endpoint
/// to generate workout plans and motivation messages.
/// When no API key is configured it returns deterministic fallback content.
/// </summary>
public class AIService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AIService> _logger;

    public AIService(HttpClient httpClient, IConfiguration configuration, ILogger<AIService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<string> GenerateWorkoutPlanAsync(
        string fitnessGoal, string availableEquipment, int availableTimeMinutes, string experienceLevel)
    {
        var prompt = $"""
            You are a certified personal trainer. Generate a daily workout plan as valid JSON only (no markdown).
            User details:
              - Fitness goal: {fitnessGoal}
              - Available equipment: {availableEquipment}
              - Available time: {availableTimeMinutes} minutes
              - Experience level: {experienceLevel}
            
            Return a JSON object with these exact fields:
            title (string), description (string), xpReward (number 50-200),
            exercises (array of: name, description, sets, reps, durationSeconds, muscleGroup).
            """;

        return await CallOpenAIAsync(prompt, FallbackWorkoutPlan(fitnessGoal, availableEquipment, availableTimeMinutes));
    }

    public async Task<string> GenerateMotivationMessageAsync(
        string username, int currentStreak, int totalXP, string fitnessGoal)
    {
        var prompt = $"""
            You are a motivational fitness coach. Write a single short motivational message (max 2 sentences) 
            for {username} who is working towards {fitnessGoal}.
            Their current streak is {currentStreak} days and they have earned {totalXP} total XP.
            Be energetic, personal, and encouraging.
            """;

        return await CallOpenAIAsync(prompt, FallbackMotivationMessage(username, currentStreak));
    }

    // ---------- helpers ----------

    private async Task<string> CallOpenAIAsync(string prompt, string fallback)
    {
        var apiKey = _configuration["OpenAI:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("OpenAI API key not configured. Using fallback content.");
            return fallback;
        }

        try
        {
            var requestBody = new
            {
                model = _configuration["OpenAI:Model"] ?? "gpt-4o-mini",
                messages = new[] { new { role = "user", content = prompt } },
                temperature = 0.7
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions")
            {
                Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
            };
            request.Headers.Add("Authorization", $"Bearer {apiKey}");

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            return json
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? fallback;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to call OpenAI API. Using fallback content.");
            return fallback;
        }
    }

    private static string FallbackWorkoutPlan(string goal, string equipment, int minutes)
    {
        return JsonSerializer.Serialize(new
        {
            title = $"{goal} Workout – {minutes} min",
            description = $"A {goal.ToLower()} focused session using {equipment}.",
            xpReward = 100,
            exercises = new[]
            {
                new { name = "Warm-Up Jog", description = "5-min light jog", sets = 1, reps = 0, durationSeconds = 300, muscleGroup = "Full Body" },
                new { name = "Push-Ups", description = "Standard push-ups", sets = 3, reps = 15, durationSeconds = 0, muscleGroup = "Chest" },
                new { name = "Bodyweight Squats", description = "Full range squats", sets = 3, reps = 20, durationSeconds = 0, muscleGroup = "Legs" },
                new { name = "Plank", description = "Core stability hold", sets = 3, reps = 0, durationSeconds = 45, muscleGroup = "Core" },
                new { name = "Cool-Down Stretch", description = "Full body stretch", sets = 1, reps = 0, durationSeconds = 300, muscleGroup = "Full Body" }
            }
        });
    }

    private static string FallbackMotivationMessage(string username, int streak)
    {
        return streak > 0
            ? $"Great job, {username}! You're on a {streak}-day streak – keep crushing it! 💪"
            : $"Welcome, {username}! Today is the first day of your fitness journey – let's go! 🔥";
    }
}
