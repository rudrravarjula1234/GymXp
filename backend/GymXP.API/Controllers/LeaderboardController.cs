using System.Security.Claims;
using GymXP.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymXP.API.Controllers;

[ApiController]
[Route("api/leaderboard")]
[Authorize]
public class LeaderboardController : ControllerBase
{
    private readonly ILeaderboardService _leaderboardService;

    public LeaderboardController(ILeaderboardService leaderboardService) => _leaderboardService = leaderboardService;

    /// <summary>Get the weekly leaderboard (top users by XP).</summary>
    [HttpGet]
    public async Task<IActionResult> GetLeaderboard([FromQuery] int top = 10)
    {
        var entries = await _leaderboardService.GetWeeklyLeaderboardAsync(top);
        return Ok(entries);
    }

    /// <summary>Get the authenticated user's rank on the leaderboard.</summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetMyRank()
    {
        var userId = GetUserId();
        var entry = await _leaderboardService.GetUserRankAsync(userId);
        if (entry == null) return NotFound(new { message = "User not ranked yet." });
        return Ok(entry);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
