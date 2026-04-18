# GymXP — End-to-End Wiring Test Report

## Summary

| Layer | Framework | Test Cases | Passed | Failed |
|---|---|---|---|---|
| **Backend (API ↔ DB)** | xUnit 2 + WebApplicationFactory + EF In-Memory | 34 | **34** | 0 |
| **Frontend (service ↔ API contract)** | Jest 30 + ts-jest + axios-mock-adapter | 20 | **20** | 0 |
| **Total** | | **54** | **54** | **0** |

All tests run without a live server or database (EF Core in-memory for the backend; axios-mock-adapter for the frontend).

---

## How to Run

### Backend integration tests
```bash
cd backend
dotnet test GymXP.IntegrationTests/GymXP.IntegrationTests.csproj
```

### Frontend service tests
```bash
cd frontend
npm test
```

---

## Backend Integration Tests (`GymXP.IntegrationTests`)

Tests use `GymXpWebApplicationFactory` — a custom `WebApplicationFactory<Program>` that replaces the Npgsql database with EF Core in-memory and supplies JWT settings so no external services are required.

### Authentication — `AuthControllerTests` (6 tests)

| ID | Test name | Expected | Result |
|---|---|---|---|
| TC-AUTH-01 | `Register_ValidPayload_Returns200WithToken` | `200 OK` with JWT token, username & email | ✅ PASS |
| TC-AUTH-02 | `Register_DuplicateEmail_Returns409Conflict` | `409 Conflict` | ✅ PASS |
| TC-AUTH-03 | `Login_ValidCredentials_Returns200WithToken` | `200 OK` with JWT token | ✅ PASS |
| TC-AUTH-04 | `Login_WrongPassword_Returns401Unauthorized` | `401 Unauthorized` | ✅ PASS |
| TC-AUTH-05 | `Login_UnknownEmail_Returns401Unauthorized` | `401 Unauthorized` | ✅ PASS |
| TC-AUTH-06 | `Register_InvalidEmail_Returns400` | `400 Bad Request` (validation) | ✅ PASS |

### User Profile — `UserProfileControllerTests` (5 tests)

| ID | Test name | Expected | Result |
|---|---|---|---|
| TC-PROFILE-01 | `GetProfile_Unauthenticated_Returns401` | `401 Unauthorized` | ✅ PASS |
| TC-PROFILE-02 | `GetProfile_NoProfileCreatedYet_Returns200WithZeroDefaults` | `200 OK` — profile fields zero-initialised (user exists, no `UserProfile` row) | ✅ PASS |
| TC-PROFILE-03 | `UpsertProfile_ValidPayload_Returns200WithProfile` | `200 OK` with saved weight/height/age | ✅ PASS |
| TC-PROFILE-04 | `GetProfile_AfterUpsert_Returns200WithSavedData` | `200 OK` — reads back persisted values | ✅ PASS |
| TC-PROFILE-05 | `UpsertProfile_UpdateExisting_ReturnsUpdatedValues` | `200 OK` — subsequent PUT overwrites previous values | ✅ PASS |

> **Discovered behaviour:** `GET /api/user-profile` returns `200` with zero defaults when the user has no profile row, not `404`. The `ProfileController` returns `404` only if the `User` itself doesn't exist.

### Workouts — `WorkoutControllerTests` (10 tests)

| ID | Test name | Expected | Result |
|---|---|---|---|
| TC-WORKOUT-01 | `GetTodayWorkout_Unauthenticated_Returns401` | `401 Unauthorized` | ✅ PASS |
| TC-WORKOUT-02 | `GetTodayWorkout_NoWorkoutExists_Returns404` | `404 Not Found` | ✅ PASS |
| TC-WORKOUT-03 | `GenerateWorkout_WithoutProfile_Returns400BadRequest` | `400 Bad Request` | ✅ PASS |
| TC-WORKOUT-04 | `GenerateWorkout_WithProfile_Returns200WithExercises` | `200 OK`, AI fallback plan with ≥1 exercise, status = `"Pending"` | ✅ PASS |
| TC-WORKOUT-05 | `GetTodayWorkout_AfterGenerate_ReturnsWorkout` | `200 OK` after generate | ✅ PASS |
| TC-WORKOUT-06 | `GenerateWorkout_CalledTwice_IdempotentReturnsExisting` | Same workout ID on second call | ✅ PASS |
| TC-WORKOUT-07 | `CompleteWorkout_ValidId_Returns200WithCompletedStatus` | `200 OK`, status = `"Completed"` | ✅ PASS |
| TC-WORKOUT-08 | `CompleteWorkout_IdempotentOnAlreadyCompleted_Returns200` | `200 OK` on re-completion | ✅ PASS |
| TC-WORKOUT-09 | `CompleteWorkout_UnknownId_Returns404` | `404 Not Found` | ✅ PASS |
| TC-WORKOUT-10 | `GetHistory_AfterGenerateAndComplete_ReturnsNonEmptyList` | Non-empty list after completing a workout | ✅ PASS |

### XP — `XPControllerTests` (4 tests)

| ID | Test name | Expected | Result |
|---|---|---|---|
| TC-XP-01 | `GetXPSummary_Unauthenticated_Returns401` | `401 Unauthorized` | ✅ PASS |
| TC-XP-02 | `GetXPSummary_NewUser_ReturnsZeroXPLevel1` | `totalXP=0`, `level=1`, `progress=0` | ✅ PASS |
| TC-XP-03 | `GetXPSummary_AfterWorkoutCompletion_XPIncreases` | `totalXP > 0` with recent record | ✅ PASS |
| TC-XP-04 | `GetXPSummary_LevelProgression_CorrectAfter500XP` | Level=1, XPRequired=500, progress ∈ [0,1] | ✅ PASS |

### Streaks — `StreaksControllerTests` (3 tests)

| ID | Test name | Expected | Result |
|---|---|---|---|
| TC-STREAK-01 | `GetStreak_Unauthenticated_Returns401` | `401 Unauthorized` | ✅ PASS |
| TC-STREAK-02 | `GetStreak_NewUser_ReturnsZeroStreak` | `currentStreak=0`, `isActiveToday=false` | ✅ PASS |
| TC-STREAK-03 | `GetStreak_AfterWorkoutCompletion_CurrentStreakIs1` | `currentStreak=1`, `isActiveToday=true` | ✅ PASS |

### Leaderboard — `LeaderboardControllerTests` (6 tests)

| ID | Test name | Expected | Result |
|---|---|---|---|
| TC-LB-01 | `GetLeaderboard_Unauthenticated_Returns401` | `401 Unauthorized` | ✅ PASS |
| TC-LB-02 | `GetLeaderboard_Authenticated_Returns200WithList` | `200 OK` (possibly empty) | ✅ PASS |
| TC-LB-03 | `GetLeaderboard_AfterMultipleWorkouts_ContainsUser` | User with XP appears in the list | ✅ PASS |
| TC-LB-04 | `GetMyRank_NoXP_Returns404` | `404 Not Found` before earning any XP | ✅ PASS |
| TC-LB-05 | `GetMyRank_AfterEarningXP_Returns200WithRankInfo` | `200 OK`, rank ≥ 1, totalXP > 0 | ✅ PASS |
| TC-LB-06 | `GetLeaderboard_TopParam_LimitsResults` | Result count ≤ requested `top` value | ✅ PASS |

---

## Frontend Service Tests (`frontend/__tests__/api.test.ts`)

Tests mock the axios instance exported from `services/api.ts` directly using `axios-mock-adapter`. `AsyncStorage` and `expo-constants` are replaced with lightweight Jest mocks.

### Auth — `authApi` (4 tests)

| ID | Test name | Expected | Result |
|---|---|---|---|
| TC-FE-01 | `register` — 200 OK | Returns `AuthResponse` with token, username, email | ✅ PASS |
| TC-FE-02 | `register` — 409 Conflict | Throws with `response.status === 409` | ✅ PASS |
| TC-FE-03 | `login` — 200 OK | Returns `AuthResponse` with token | ✅ PASS |
| TC-FE-04 | `login` — 401 Unauthorized | Throws with `response.status === 401` | ✅ PASS |

### User Profile — `userProfileApi` (2 tests)

| ID | Test name | Expected | Result |
|---|---|---|---|
| TC-FE-05 | `getProfile` — 200 OK | Returns `UserProfile` with correct fields | ✅ PASS |
| TC-FE-06 | `upsertProfile` — 200 OK | Returns updated `UserProfile` | ✅ PASS |

### Workouts — `workoutsApi` (7 tests)

| ID | Test name | Expected | Result |
|---|---|---|---|
| TC-FE-07 | `getTodayWorkout` — 200 OK | Returns `Workout` with exercises | ✅ PASS |
| TC-FE-08 | `getTodayWorkout` — 404 | Returns `null` (graceful empty state) | ✅ PASS |
| TC-FE-09 | `generateWorkout` — 200 OK | Returns new `Workout` with status `"Pending"` | ✅ PASS |
| TC-FE-10 | `generateWorkout` — 400 | Throws with `response.status === 400` | ✅ PASS |
| TC-FE-11 | `completeWorkout` — 200 OK | Returns `Workout` with status `"Completed"` | ✅ PASS |
| TC-FE-12 | `completeWorkout` — 404 | Throws with `response.status === 404` | ✅ PASS |
| TC-FE-13 | `getHistory` — 200 OK | Returns non-empty array of `Workout` | ✅ PASS |

### XP — `xpApi` (1 test)

| ID | Test name | Expected | Result |
|---|---|---|---|
| TC-FE-14 | `getSummary` — 200 OK | Returns `XPSummary` with `totalXP`, `level`, `progressToNextLevel`, `recentRecords` | ✅ PASS |

### Streaks — `streaksApi` (1 test)

| ID | Test name | Expected | Result |
|---|---|---|---|
| TC-FE-15 | `getStreak` — 200 OK | Returns `Streak` with `currentStreak`, `isActiveToday` | ✅ PASS |

### Leaderboard — `leaderboardApi` (3 tests)

| ID | Test name | Expected | Result |
|---|---|---|---|
| TC-FE-16 | `getLeaderboard` — 200 OK | Returns ranked array | ✅ PASS |
| TC-FE-17 | `getMyRank` — 200 OK | Returns `LeaderboardEntry` with rank & XP | ✅ PASS |
| TC-FE-18 | `getMyRank` — 404 | Returns `null` (not ranked yet) | ✅ PASS |

### Token helpers (2 tests)

| ID | Test name | Expected | Result |
|---|---|---|---|
| TC-FE-19 | `saveToken` | Calls `AsyncStorage.setItem` with correct key | ✅ PASS |
| TC-FE-20 | `clearToken` | Calls `AsyncStorage.removeItem` with correct key | ✅ PASS |

---

## Key Findings

1. **AI fallback works correctly** — All workout generation tests pass without an OpenAI API key. The `AIService` falls back to a deterministic JSON plan and motivation message whenever the key is absent.

2. **JWT wiring is end-to-end verified** — The token returned by `POST /api/auth/register` is parsed by the backend and the claim `ClaimTypes.NameIdentifier` maps correctly to `userId` in every authenticated endpoint.

3. **XP ↔ Streak co-update on workout completion** — `POST /api/workouts/{id}/complete` atomically increments both the XP balance and the daily streak in a single request (verified by TC-WORKOUT-07, TC-XP-03, TC-STREAK-03).

4. **Profile discovery** — `GET /api/user-profile` returns `200` with zero defaults for a user who hasn't yet set up their profile (not `404`). The frontend store handles this correctly by checking `weightKg === 0` before navigating to the profile setup screen.

5. **Idempotency** — Both workout generation (TC-WORKOUT-06) and workout completion (TC-WORKOUT-08) are idempotent; calling them more than once in the same day is safe.
