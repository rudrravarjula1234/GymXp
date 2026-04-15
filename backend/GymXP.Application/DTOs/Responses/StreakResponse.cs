namespace GymXP.Application.DTOs.Responses;

public class StreakResponse
{
    public Guid UserId { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime? LastActivityDate { get; set; }
    public bool IsActiveToday { get; set; }
}
