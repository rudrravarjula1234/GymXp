namespace GymXP.Application.DTOs.Responses;

public class XPSummaryResponse
{
    public Guid UserId { get; set; }
    public int TotalXP { get; set; }
    public int Level { get; set; }
    public int XPForCurrentLevel { get; set; }
    public int XPRequiredForNextLevel { get; set; }
    public float ProgressToNextLevel { get; set; }
    public List<XPRecordResponse> RecentRecords { get; set; } = new();
}

public class XPRecordResponse
{
    public int PointsEarned { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime EarnedAt { get; set; }
}
