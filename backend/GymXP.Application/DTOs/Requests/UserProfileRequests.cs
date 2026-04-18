using System.ComponentModel.DataAnnotations;
using GymXP.Domain.Enums;

namespace GymXP.Application.DTOs.Requests;

public class UpsertUserProfileRequest
{
    [Range(20, 300)]
    public float WeightKg { get; set; }

    [Range(50, 250)]
    public float HeightCm { get; set; }

    [Range(10, 120)]
    public int AgeYears { get; set; }

    public FitnessGoal Goal { get; set; }
    public ExperienceLevel ExperienceLevel { get; set; }

    public string AvailableEquipment { get; set; } = "park gym";

    [Range(15, 180)]
    public int AvailableTimeMinutes { get; set; } = 45;
}
