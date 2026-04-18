namespace GymXP.Application.Interfaces;

/// <summary>AI service for generating workout plans and motivation messages.</summary>
public interface IAIService
{
    /// <summary>Generates a structured workout plan based on user profile and history.</summary>
    Task<string> GenerateWorkoutPlanAsync(string fitnessGoal, string availableEquipment, int availableTimeMinutes, string experienceLevel);

    /// <summary>Generates a personalized motivation message for the user.</summary>
    Task<string> GenerateMotivationMessageAsync(string username, int currentStreak, int totalXP, string fitnessGoal);
}
