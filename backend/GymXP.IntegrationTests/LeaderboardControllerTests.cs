using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using GymXP.Application.DTOs.Responses;
using FluentAssertions;

namespace GymXP.IntegrationTests;

/// <summary>Tests for GET /api/leaderboard and GET /api/leaderboard/me.</summary>
public class LeaderboardControllerTests : IClassFixture<GymXpWebApplicationFactory>
{
    private readonly HttpClient _client;

    public LeaderboardControllerTests(GymXpWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ── TC-LB-01 ───────────────────────────────────────────────────────────────
    [Fact]
    public async Task GetLeaderboard_Unauthenticated_Returns401()
    {
        var response = await _client.GetAsync("/api/leaderboard");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── TC-LB-02 ───────────────────────────────────────────────────────────────
    [Fact]
    public async Task GetLeaderboard_Authenticated_Returns200WithList()
    {
        await AuthenticateAsync("lb@test.com", "lbUser");

        var response = await _client.GetAsync("/api/leaderboard");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        // Could be empty list – just ensure 200 and parsable
        var entries = await response.Content.ReadFromJsonAsync<List<LeaderboardEntryResponse>>();
        entries.Should().NotBeNull();
    }

    // ── TC-LB-03 ───────────────────────────────────────────────────────────────
    [Fact]
    public async Task GetLeaderboard_AfterMultipleWorkouts_ContainsUser()
    {
        await AuthenticateAsync("lbTop@test.com", "lbTopUser");
        await UpsertDefaultProfileAsync();
        var gen = await _client.PostAsync("/api/workouts/generate", null);
        var workout = await gen.Content.ReadFromJsonAsync<WorkoutResponse>();
        await _client.PostAsync($"/api/workouts/{workout!.Id}/complete", null);

        var response = await _client.GetAsync("/api/leaderboard");

        var entries = await response.Content.ReadFromJsonAsync<List<LeaderboardEntryResponse>>();
        entries.Should().Contain(e => e.Username == "lbTopUser");
    }

    // ── TC-LB-04 ───────────────────────────────────────────────────────────────
    [Fact]
    public async Task GetMyRank_NoXP_Returns404()
    {
        await AuthenticateAsync("lbNoXP@test.com", "lbNoXP");

        var response = await _client.GetAsync("/api/leaderboard/me");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ── TC-LB-05 ───────────────────────────────────────────────────────────────
    [Fact]
    public async Task GetMyRank_AfterEarningXP_Returns200WithRankInfo()
    {
        await AuthenticateAsync("lbHasXP@test.com", "lbHasXP");
        await UpsertDefaultProfileAsync();
        var gen = await _client.PostAsync("/api/workouts/generate", null);
        var workout = await gen.Content.ReadFromJsonAsync<WorkoutResponse>();
        await _client.PostAsync($"/api/workouts/{workout!.Id}/complete", null);

        var response = await _client.GetAsync("/api/leaderboard/me");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var entry = await response.Content.ReadFromJsonAsync<LeaderboardEntryResponse>();
        entry.Should().NotBeNull();
        entry!.Username.Should().Be("lbHasXP");
        entry.TotalXP.Should().BeGreaterThan(0);
        entry.Rank.Should().BeGreaterThan(0);
    }

    // ── TC-LB-06 ───────────────────────────────────────────────────────────────
    [Fact]
    public async Task GetLeaderboard_TopParam_LimitsResults()
    {
        await AuthenticateAsync("lbTop3@test.com", "lbTop3");

        var response = await _client.GetAsync("/api/leaderboard?top=3");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var entries = await response.Content.ReadFromJsonAsync<List<LeaderboardEntryResponse>>();
        entries.Should().NotBeNull();
        entries!.Count.Should().BeLessThanOrEqualTo(3);
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
