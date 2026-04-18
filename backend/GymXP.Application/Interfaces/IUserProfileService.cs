using GymXP.Application.DTOs.Requests;
using GymXP.Application.DTOs.Responses;

namespace GymXP.Application.Interfaces;

/// <summary>Manages user profile data.</summary>
public interface IUserProfileService
{
    Task<UserProfileResponse?> GetProfileAsync(Guid userId);
    Task<UserProfileResponse> CreateOrUpdateProfileAsync(Guid userId, UpsertUserProfileRequest request);
}
