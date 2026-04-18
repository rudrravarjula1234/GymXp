using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using GymXP.Application.DTOs.Responses;
using FluentAssertions;

namespace GymXP.IntegrationTests;

/// <summary>Tests for the /api/workouts endpoints.</summary>
public class WorkoutControllerTests : IClassFixture<GymXpWebApplicationFactory>
{
    private readonly HttpClient _client;

    public WorkoutControllerTests(GymXpWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ── TC-WORKOUT-01 ──────────────────────────────────────────────────────────
    [Fact]
    public async Task GetTodayWorkout_Unauthenticated_Returns401()
    {
        var response = await _client.GetAsync("/api/workouts/today");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── TC-WORKOUT-02 ──────────────────────────────────────────────────────────
    [Fact]
    public async Task GetTodayWorkout_NoWorkoutExists_Returns404()
    {
        await AuthenticateAsync("noWorkout@test.com", "noWorkout");

        var response = await _client.GetAsync("/api/workouts/today");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ── TC-WORKOUT-03 ──────────────────────────────────────────────────────────
    [Fact]
    public async Task GenerateWorkout_WithoutProfile_Returns400BadRequest()
    {
        await AuthenticateAsync("noProfile@workout.com", "noProfileWorkout");

        var response = await _client.PostAsync("/api/workouts/generate", null);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // ── TC-WORKOUT-04 ──────────────────────────────────────────────────────────
    [Fact]
    public async Task GenerateWorkout_WithProfile_Returns200WithExercises()
    {
        await AuthenticateAsync("generateOk@test.com", "generateOk");
        await UpsertDefaultProfileAsync();

        var response = await _client.PostAsync("/api/workouts/generate", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var workout = await response.Content.ReadFromJsonAsync<WorkoutResponse>();
        workout.Should().NotBeNull();
        workout!.Id.Should().NotBeEmpty();
        workout.Title.Should().NotBeNullOrWhiteSpace();
        workout.Exercises.Should().NotBeEmpty();
        workout.Status.Should().Be("Pending");
    }

    // ── TC-WORKOUT-05 ──────────────────────────────────────────────────────────
    [Fact]
    public async Task GetTodayWorkout_AfterGenerate_ReturnsWorkout()
    {
        await AuthenticateAsync("getTodayOk@test.com", "getTodayOk");
        await UpsertDefaultProfileAsync();
        await _client.PostAsync("/api/workouts/generate", null);

        var response = await _client.GetAsync("/api/workouts/today");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var workout = await response.Content.ReadFromJsonAsync<WorkoutResponse>();
        workout!.Title.Should().NotBeNullOrWhiteSpace();
    }

    // ── TC-WORKOUT-06 ──────────────────────────────────────────────────────────
    [Fact]
    public async Task GenerateWorkout_CalledTwice_IdempotentReturnsExisting()
    {
        await AuthenticateAsync("idempotent@test.com", "idempotent");
        await UpsertDefaultProfileAsync();

        var r1 = await _client.PostAsync("/api/workouts/generate", null);
        var w1 = await r1.Content.ReadFromJsonAsync<WorkoutResponse>();

        var r2 = await _client.PostAsync("/api/workouts/generate", null);
        var w2 = await r2.Content.ReadFromJsonAsync<WorkoutResponse>();

        r2.StatusCode.Should().Be(HttpStatusCode.OK);
        w2!.Id.Should().Be(w1!.Id, "generate should return the same workout if one exists today");
    }

    // ── TC-WORKOUT-07 ──────────────────────────────────────────────────────────
    [Fact]
    public async Task CompleteWorkout_ValidId_Returns200WithCompletedStatus()
    {
        await AuthenticateAsync("complete@test.com", "completeUser");
        await UpsertDefaultProfileAsync();
        var genResponse = await _client.PostAsync("/api/workouts/generate", null);
        var workout = await genResponse.Content.ReadFromJsonAsync<WorkoutResponse>();

        var response = await _client.PostAsync($"/api/workouts/{workout!.Id}/complete", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var completed = await response.Content.ReadFromJsonAsync<WorkoutResponse>();
        completed!.Status.Should().Be("Completed");
    }

    // ── TC-WORKOUT-08 ──────────────────────────────────────────────────────────
    [Fact]
    public async Task CompleteWorkout_IdempotentOnAlreadyCompleted_Returns200()
    {
        await AuthenticateAsync("completeIdempotent@test.com", "completeIdempotent");
        await UpsertDefaultProfileAsync();
        var genResponse = await _client.PostAsync("/api/workouts/generate", null);
        var workout = await genResponse.Content.ReadFromJsonAsync<WorkoutResponse>();

        await _client.PostAsync($"/api/workouts/{workout!.Id}/complete", null);
        var response2 = await _client.PostAsync($"/api/workouts/{workout.Id}/complete", null);

        response2.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response2.Content.ReadFromJsonAsync<WorkoutResponse>();
        body!.Status.Should().Be("Completed");
    }

    // ── TC-WORKOUT-09 ──────────────────────────────────────────────────────────
    [Fact]
    public async Task CompleteWorkout_UnknownId_Returns404()
    {
        await AuthenticateAsync("completeNotFound@test.com", "completeNotFound");

        var response = await _client.PostAsync($"/api/workouts/{Guid.NewGuid()}/complete", null);
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ── TC-WORKOUT-10 ──────────────────────────────────────────────────────────
    [Fact]
    public async Task GetHistory_AfterGenerateAndComplete_ReturnsNonEmptyList()
    {
        await AuthenticateAsync("history@test.com", "historyUser");
        await UpsertDefaultProfileAsync();
        var genResponse = await _client.PostAsync("/api/workouts/generate", null);
        var workout = await genResponse.Content.ReadFromJsonAsync<WorkoutResponse>();
        await _client.PostAsync($"/api/workouts/{workout!.Id}/complete", null);

        var response = await _client.GetAsync("/api/workouts/history");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var workouts = await response.Content.ReadFromJsonAsync<List<WorkoutResponse>>();
        workouts.Should().NotBeEmpty();
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
        var payload = new
        {
            weightKg = 72f, heightCm = 178f, ageYears = 27,
            goal = 0, experienceLevel = 1,
            availableEquipment = "bodyweight",
            availableTimeMinutes = 30
        };
        await _client.PutAsJsonAsync("/api/user-profile", payload);
    }
}
