using System.Security.Claims;
using GymXP.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymXP.API.Controllers;

[ApiController]
[Route("api/xp")]
[Authorize]
public class XPController : ControllerBase
{
    private readonly IXPService _xpService;

    public XPController(IXPService xpService) => _xpService = xpService;

    /// <summary>Get XP summary and level progression for the authenticated user.</summary>
    [HttpGet]
    public async Task<IActionResult> GetXPSummary()
    {
        var userId = GetUserId();
        var summary = await _xpService.GetXPSummaryAsync(userId);
        return Ok(summary);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
