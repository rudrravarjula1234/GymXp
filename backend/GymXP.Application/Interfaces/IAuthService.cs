using GymXP.Application.DTOs.Requests;
using GymXP.Application.DTOs.Responses;

namespace GymXP.Application.Interfaces;

/// <summary>Handles user authentication and registration.</summary>
public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}
