using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using GymXP.Application.DTOs.Responses;
using FluentAssertions;

namespace GymXP.IntegrationTests;

/// <summary>Tests for GET /api/streaks — streak tracking.</summary>
public class StreaksControllerTests : IClassFixture<GymXpWebApplicationFactory>
{
    private readonly HttpClient _client;

    public StreaksControllerTests(GymXpWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ── TC-STREAK-01 ───────────────────────────────────────────────────────────
    [Fact]
    public async Task GetStreak_Unauthenticated_Returns401()
    {
        var response = await _client.GetAsync("/api/streaks");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── TC-STREAK-02 ───────────────────────────────────────────────────────────
    [Fact]
    public async Task GetStreak_NewUser_ReturnsZeroStreak()
    {
        await AuthenticateAsync("streakNew@test.com", "streakNew");

        var response = await _client.GetAsync("/api/streaks");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<StreakResponse>();
        body.Should().NotBeNull();
        body!.CurrentStreak.Should().Be(0);
        body.LongestStreak.Should().Be(0);
        body.IsActiveToday.Should().BeFalse();
    }

    // ── TC-STREAK-03 ───────────────────────────────────────────────────────────
    [Fact]
    public async Task GetStreak_AfterWorkoutCompletion_CurrentStreakIs1()
    {
        await AuthenticateAsync("streakAfter@test.com", "streakAfter");
        await UpsertDefaultProfileAsync();

        var genResponse = await _client.PostAsync("/api/workouts/generate", null);
        var workout = await genResponse.Content.ReadFromJsonAsync<WorkoutResponse>();
        await _client.PostAsync($"/api/workouts/{workout!.Id}/complete", null);

        var response = await _client.GetAsync("/api/streaks");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<StreakResponse>();
        body!.CurrentStreak.Should().Be(1);
        body.LongestStreak.Should().Be(1);
        body.IsActiveToday.Should().BeTrue();
        body.LastActivityDate.Should().NotBeNull();
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
