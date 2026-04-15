namespace GymXP.Application.DTOs.Responses;

public class LeaderboardEntryResponse
{
    public int Rank { get; set; }
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int TotalXP { get; set; }
    public int Level { get; set; }
    public int CurrentStreak { get; set; }
}
