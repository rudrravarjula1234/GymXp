using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using GymXP.Application.DTOs.Responses;
using FluentAssertions;

namespace GymXP.IntegrationTests;

/// <summary>Tests for GET /api/user-profile and PUT /api/user-profile.</summary>
public class UserProfileControllerTests : IClassFixture<GymXpWebApplicationFactory>
{
    private readonly HttpClient _client;

    public UserProfileControllerTests(GymXpWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ── TC-PROFILE-01 ──────────────────────────────────────────────────────────
    [Fact]
    public async Task GetProfile_Unauthenticated_Returns401()
    {
        var response = await _client.GetAsync("/api/user-profile");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── TC-PROFILE-02 ──────────────────────────────────────────────────────────
    [Fact]
    public async Task GetProfile_NoProfileCreatedYet_Returns200WithZeroDefaults()
    {
        // The API returns 200 with zeroed-out defaults when a user exists but
        // has not yet set up their profile (no UserProfile row in the DB).
        var token = await RegisterAndGetToken("noProfile@test.com", "noProfile");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync("/api/user-profile");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<UserProfileResponse>();
        body.Should().NotBeNull();
        body!.WeightKg.Should().Be(0f, "profile not yet populated");
        body.HeightCm.Should().Be(0f, "profile not yet populated");
        body.TotalXP.Should().Be(0);
        body.Level.Should().Be(1);
    }

    // ── TC-PROFILE-03 ──────────────────────────────────────────────────────────
    [Fact]
    public async Task UpsertProfile_ValidPayload_Returns200WithProfile()
    {
        var token = await RegisterAndGetToken("upsertUser@test.com", "upsertUser");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var payload = new
        {
            weightKg = 75.5f,
            heightCm = 180f,
            ageYears = 28,
            goal = 0,             // FitnessGoal.WeightLoss = 0
            experienceLevel = 1,  // ExperienceLevel.Intermediate = 1
            availableEquipment = "barbell, dumbbells",
            availableTimeMinutes = 60
        };

        var response = await _client.PutAsJsonAsync("/api/user-profile", payload);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<UserProfileResponse>();
        body.Should().NotBeNull();
        body!.WeightKg.Should().Be(75.5f);
        body.HeightCm.Should().Be(180f);
        body.AgeYears.Should().Be(28);
    }

    // ── TC-PROFILE-04 ──────────────────────────────────────────────────────────
    [Fact]
    public async Task GetProfile_AfterUpsert_Returns200WithSavedData()
    {
        var token = await RegisterAndGetToken("getAfterUpsert@test.com", "getAfterUpsert");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var payload = new
        {
            weightKg = 65f, heightCm = 170f, ageYears = 25,
            goal = 1, experienceLevel = 0,
            availableEquipment = "bodyweight",
            availableTimeMinutes = 30
        };
        await _client.PutAsJsonAsync("/api/user-profile", payload);

        var getResponse = await _client.GetAsync("/api/user-profile");

        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await getResponse.Content.ReadFromJsonAsync<UserProfileResponse>();
        body!.WeightKg.Should().Be(65f);
        body.AvailableEquipment.Should().Be("bodyweight");
    }

    // ── TC-PROFILE-05 ──────────────────────────────────────────────────────────
    [Fact]
    public async Task UpsertProfile_UpdateExisting_ReturnsUpdatedValues()
    {
        var token = await RegisterAndGetToken("updateProfile@test.com", "updateProfile");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var initial = new { weightKg = 80f, heightCm = 175f, ageYears = 30, goal = 0, experienceLevel = 0, availableEquipment = "gym", availableTimeMinutes = 45 };
        await _client.PutAsJsonAsync("/api/user-profile", initial);

        var updated = new { weightKg = 78f, heightCm = 175f, ageYears = 30, goal = 2, experienceLevel = 2, availableEquipment = "home gym", availableTimeMinutes = 60 };
        var updateResponse = await _client.PutAsJsonAsync("/api/user-profile", updated);

        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await updateResponse.Content.ReadFromJsonAsync<UserProfileResponse>();
        body!.WeightKg.Should().Be(78f);
        body.AvailableTimeMinutes.Should().Be(60);
    }

    // ---------- helper ----------

    private async Task<string> RegisterAndGetToken(string email, string username)
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register",
            new { email, username, password = "Password1!" });
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        return auth!.Token;
    }
}
