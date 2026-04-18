using System.Net;
using System.Net.Http.Json;
using GymXP.Application.DTOs.Responses;
using FluentAssertions;

namespace GymXP.IntegrationTests;

/// <summary>Tests for POST /api/auth/register and POST /api/auth/login.</summary>
public class AuthControllerTests : IClassFixture<GymXpWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthControllerTests(GymXpWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ── TC-AUTH-01 ─────────────────────────────────────────────────────────────
    [Fact]
    public async Task Register_ValidPayload_Returns200WithToken()
    {
        var payload = new { email = "alice@test.com", username = "alice", password = "Password1!" };

        var response = await _client.PostAsJsonAsync("/api/auth/register", payload);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<AuthResponse>();
        body.Should().NotBeNull();
        body!.Token.Should().NotBeNullOrWhiteSpace();
        body.Username.Should().Be("alice");
        body.Email.Should().Be("alice@test.com");
        body.UserId.Should().NotBeEmpty();
    }

    // ── TC-AUTH-02 ─────────────────────────────────────────────────────────────
    [Fact]
    public async Task Register_DuplicateEmail_Returns409Conflict()
    {
        var payload = new { email = "bob@test.com", username = "bob1", password = "Password1!" };
        await _client.PostAsJsonAsync("/api/auth/register", payload); // first registration

        var response = await _client.PostAsJsonAsync("/api/auth/register", payload); // duplicate

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    // ── TC-AUTH-03 ─────────────────────────────────────────────────────────────
    [Fact]
    public async Task Login_ValidCredentials_Returns200WithToken()
    {
        var email = "carol@test.com";
        var password = "Secure123!";
        await _client.PostAsJsonAsync("/api/auth/register",
            new { email, username = "carol", password });

        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new { email, password });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<AuthResponse>();
        body!.Token.Should().NotBeNullOrWhiteSpace();
    }

    // ── TC-AUTH-04 ─────────────────────────────────────────────────────────────
    [Fact]
    public async Task Login_WrongPassword_Returns401Unauthorized()
    {
        var email = "dave@test.com";
        await _client.PostAsJsonAsync("/api/auth/register",
            new { email, username = "dave", password = "Correct123!" });

        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new { email, password = "WrongPassword!" });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── TC-AUTH-05 ─────────────────────────────────────────────────────────────
    [Fact]
    public async Task Login_UnknownEmail_Returns401Unauthorized()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login",
            new { email = "nobody@test.com", password = "Whatever1!" });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ── TC-AUTH-06 ─────────────────────────────────────────────────────────────
    [Fact]
    public async Task Register_InvalidEmail_Returns400()
    {
        var payload = new { email = "not-an-email", username = "x", password = "Pass1!" };

        var response = await _client.PostAsJsonAsync("/api/auth/register", payload);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
