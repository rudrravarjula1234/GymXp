using GymXP.Domain.Common;
using GymXP.Domain.Enums;

namespace GymXP.Domain.Entities;

/// <summary>Stores fitness-related profile data for a user.</summary>
public class UserProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public float WeightKg { get; set; }
    public float HeightCm { get; set; }
    public int AgeYears { get; set; }
    public FitnessGoal Goal { get; set; }
    public ExperienceLevel ExperienceLevel { get; set; }

    /// <summary>Available equipment (e.g. "park gym, dumbbells").</summary>
    public string AvailableEquipment { get; set; } = string.Empty;

    /// <summary>Time the user can dedicate per workout session in minutes.</summary>
    public int AvailableTimeMinutes { get; set; }

    // Navigation property
    public User User { get; set; } = null!;
}
