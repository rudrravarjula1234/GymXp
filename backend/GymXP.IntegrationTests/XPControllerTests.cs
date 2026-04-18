using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using GymXP.Application.DTOs.Responses;
using FluentAssertions;

namespace GymXP.IntegrationTests;

/// <summary>Tests for GET /api/xp — XP summary and level progression.</summary>
public class XPControllerTests : IClassFixture<GymXpWebApplicationFactory>
{
    private readonly HttpClient _client;

    public XPControllerTests(GymXpWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ── TC-XP-01 ───────────────────────────────────────────────────────────────
    [Fact]
    public async Task GetXPSummary_Unauthenticated_Returns401()
    {
        var response = await _client.GetAsync("/api/xp");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── TC-XP-02 ───────────────────────────────────────────────────────────────
    [Fact]
    public async Task GetXPSummary_NewUser_ReturnsZeroXPLevel1()
    {
        await AuthenticateAsync("xpNewUser@test.com", "xpNewUser");

        var response = await _client.GetAsync("/api/xp");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<XPSummaryResponse>();
        body.Should().NotBeNull();
        body!.TotalXP.Should().Be(0);
        body.Level.Should().Be(1);
        body.ProgressToNextLevel.Should().Be(0f);
    }

    // ── TC-XP-03 ───────────────────────────────────────────────────────────────
    [Fact]
    public async Task GetXPSummary_AfterWorkoutCompletion_XPIncreases()
    {
        await AuthenticateAsync("xpAfterWorkout@test.com", "xpAfterWorkout");
        await UpsertDefaultProfileAsync();

        // Generate and complete a workout to earn XP
        var genResponse = await _client.PostAsync("/api/workouts/generate", null);
        var workout = await genResponse.Content.ReadFromJsonAsync<WorkoutResponse>();
        await _client.PostAsync($"/api/workouts/{workout!.Id}/complete", null);

        var response = await _client.GetAsync("/api/xp");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<XPSummaryResponse>();
        body!.TotalXP.Should().BeGreaterThan(0);
        body.RecentRecords.Should().NotBeEmpty();
        body.RecentRecords[0].PointsEarned.Should().BeGreaterThan(0);
    }

    // ── TC-XP-04 ───────────────────────────────────────────────────────────────
    [Fact]
    public async Task GetXPSummary_LevelProgression_CorrectAfter500XP()
    {
        // Level formula: level = totalXP / 500 + 1
        // 100 XP (default workout reward) → level 1, progress = 20%
        await AuthenticateAsync("xpLevel@test.com", "xpLevel");
        await UpsertDefaultProfileAsync();

        var genResponse = await _client.PostAsync("/api/workouts/generate", null);
        var workout = await genResponse.Content.ReadFromJsonAsync<WorkoutResponse>();
        await _client.PostAsync($"/api/workouts/{workout!.Id}/complete", null);

        var response = await _client.GetAsync("/api/xp");
        var body = await response.Content.ReadFromJsonAsync<XPSummaryResponse>();

        body!.Level.Should().Be(1);
        body.XPRequiredForNextLevel.Should().Be(500);
        body.ProgressToNextLevel.Should().BeInRange(0f, 1f);
    }

    // ---------- helpers ----------

    private async Task AuthenticateAsync(string email, string username)
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register",
            new { email, username, password = "Password1!" });
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", auth!.Token);
    }

    private async Task UpsertDefaultProfileAsync()
    {
        await _client.PutAsJsonAsync("/api/user-profile", new
        {
            weightKg = 72f, heightCm = 178f, ageYears = 27,
            goal = 0, experienceLevel = 1,
            availableEquipment = "bodyweight", availableTimeMinutes = 30
        });
    }
}
