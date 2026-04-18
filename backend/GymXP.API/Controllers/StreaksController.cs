using System.Security.Claims;
using GymXP.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymXP.API.Controllers;

[ApiController]
[Route("api/streaks")]
[Authorize]
public class StreaksController : ControllerBase
{
    private readonly IStreakService _streakService;

    public StreaksController(IStreakService streakService) => _streakService = streakService;

    /// <summary>Get streak data for the authenticated user.</summary>
    [HttpGet]
    public async Task<IActionResult> GetStreak()
    {
        var userId = GetUserId();
        var streak = await _streakService.GetStreakAsync(userId);
        return Ok(streak);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
