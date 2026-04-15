using GymXP.Domain.Enums;

namespace GymXP.Application.DTOs.Responses;

public class UserProfileResponse
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public float WeightKg { get; set; }
    public float HeightCm { get; set; }
    public int AgeYears { get; set; }
    public string Goal { get; set; } = string.Empty;
    public string ExperienceLevel { get; set; } = string.Empty;
    public string AvailableEquipment { get; set; } = string.Empty;
    public int AvailableTimeMinutes { get; set; }
    public int TotalXP { get; set; }
    public int Level { get; set; }
    public int CurrentStreak { get; set; }
}
