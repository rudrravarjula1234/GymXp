using System.Security.Claims;
using GymXP.Application.DTOs.Requests;
using GymXP.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymXP.API.Controllers;

[ApiController]
[Route("api/user-profile")]
[Authorize]
public class UserProfileController : ControllerBase
{
    private readonly IUserProfileService _profileService;

    public UserProfileController(IUserProfileService profileService) => _profileService = profileService;

    /// <summary>Get the profile for the authenticated user.</summary>
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetUserId();
        var profile = await _profileService.GetProfileAsync(userId);
        if (profile == null) return NotFound(new { message = "Profile not found." });
        return Ok(profile);
    }

    /// <summary>Create or update the profile for the authenticated user.</summary>
    [HttpPut]
    public async Task<IActionResult> UpsertProfile([FromBody] UpsertUserProfileRequest request)
    {
        var userId = GetUserId();
        var profile = await _profileService.CreateOrUpdateProfileAsync(userId, request);
        return Ok(profile);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
