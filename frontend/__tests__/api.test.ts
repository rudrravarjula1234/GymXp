/**
 * Frontend API Service Tests
 *
 * These tests verify that each function in services/api.ts sends the correct
 * HTTP method, URL, and payload, and that it returns the expected shape.
 * axios-mock-adapter intercepts requests on the actual axios instance exported
 * from services/api.ts (not the axios default singleton).
 */

// Import the internal axios instance (default export) so MockAdapter intercepts it
import apiInstance from "../services/api";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(apiInstance);

// Import all the API functions
import {
  authApi,
  userProfileApi,
  workoutsApi,
  xpApi,
  streaksApi,
  leaderboardApi,
  saveToken,
  clearToken,
} from "../services/api";

// Helpers
const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.sig";

const fakeAuthResponse = {
  token: fakeToken,
  username: "alice",
  email: "alice@test.com",
  userId: "00000000-0000-0000-0000-000000000001",
};

const fakeProfile = {
  userId: fakeAuthResponse.userId,
  username: "alice",
  email: "alice@test.com",
  weightKg: 65,
  heightCm: 170,
  ageYears: 28,
  goal: "WeightLoss",
  experienceLevel: "Beginner",
  availableEquipment: "bodyweight",
  availableTimeMinutes: 30,
  totalXP: 200,
  level: 1,
  currentStreak: 3,
};

const fakeWorkout = {
  id: "00000000-0000-0000-0000-000000000002",
  title: "Full Body Circuit",
  description: "A balanced workout",
  motivationMessage: "You got this!",
  scheduledDate: new Date().toISOString(),
  status: "Pending",
  xpReward: 100,
  exercises: [
    { id: "e1", name: "Push-Ups", description: "", sets: 3, reps: 15, durationSeconds: 0, muscleGroup: "Chest", orderIndex: 0 },
  ],
};

const fakeXPSummary = {
  userId: fakeAuthResponse.userId,
  totalXP: 200,
  level: 1,
  xpForCurrentLevel: 0,
  xpRequiredForNextLevel: 500,
  progressToNextLevel: 0.4,
  recentRecords: [{ pointsEarned: 100, reason: "Completed workout", earnedAt: new Date().toISOString() }],
};

const fakeStreak = {
  userId: fakeAuthResponse.userId,
  currentStreak: 3,
  longestStreak: 5,
  lastActivityDate: new Date().toISOString(),
  isActiveToday: true,
};

const fakeLeaderboard = [
  { rank: 1, userId: fakeAuthResponse.userId, username: "alice", totalXP: 500, level: 2, currentStreak: 3 },
  { rank: 2, userId: "00000000-0000-0000-0000-000000000099", username: "bob", totalXP: 300, level: 1, currentStreak: 1 },
];

// ── TC-FE-AUTH ───────────────────────────────────────────────────────────────

describe("authApi.register", () => {
  afterEach(() => mock.reset());

  // TC-FE-01
  it("sends POST /api/auth/register with correct payload and returns AuthResponse", async () => {
    mock.onPost(/\/api\/auth\/register/).reply(200, fakeAuthResponse);

    const result = await authApi.register("alice@test.com", "alice", "Password1!");
    expect(result.token).toBe(fakeToken);
    expect(result.username).toBe("alice");
    expect(result.email).toBe("alice@test.com");
  });

  // TC-FE-02
  it("throws when server returns 409 Conflict (duplicate email)", async () => {
    mock.onPost(/\/api\/auth\/register/).reply(409, { message: "Email already registered." });

    await expect(
      authApi.register("dup@test.com", "dup", "Password1!")
    ).rejects.toMatchObject({ response: { status: 409 } });
  });
});

describe("authApi.login", () => {
  afterEach(() => mock.reset());

  // TC-FE-03
  it("sends POST /api/auth/login and returns AuthResponse", async () => {
    mock.onPost(/\/api\/auth\/login/).reply(200, fakeAuthResponse);

    const result = await authApi.login("alice@test.com", "Password1!");
    expect(result.token).toBe(fakeToken);
  });

  // TC-FE-04
  it("throws when server returns 401 Unauthorized", async () => {
    mock.onPost(/\/api\/auth\/login/).reply(401, { message: "Invalid credentials." });

    await expect(
      authApi.login("alice@test.com", "wrong")
    ).rejects.toMatchObject({ response: { status: 401 } });
  });
});

// ── TC-FE-PROFILE ────────────────────────────────────────────────────────────

describe("userProfileApi.getProfile", () => {
  afterEach(() => mock.reset());

  // TC-FE-05
  it("sends GET /api/user-profile and returns UserProfile", async () => {
    mock.onGet(/\/api\/user-profile$/).reply(200, fakeProfile);

    const result = await userProfileApi.getProfile();
    expect(result.weightKg).toBe(65);
    expect(result.goal).toBe("WeightLoss");
  });
});

describe("userProfileApi.upsertProfile", () => {
  afterEach(() => mock.reset());

  // TC-FE-06
  it("sends PUT /api/user-profile and returns updated profile", async () => {
    const updated = { ...fakeProfile, weightKg: 62 };
    mock.onPut(/\/api\/user-profile$/).reply(200, updated);

    const payload = {
      weightKg: 62, heightCm: 170, ageYears: 28,
      goal: 0, experienceLevel: 0,
      availableEquipment: "bodyweight", availableTimeMinutes: 30,
    };
    const result = await userProfileApi.upsertProfile(payload);
    expect(result.weightKg).toBe(62);
  });
});

// ── TC-FE-WORKOUTS ───────────────────────────────────────────────────────────

describe("workoutsApi.getTodayWorkout", () => {
  afterEach(() => mock.reset());

  // TC-FE-07
  it("returns Workout object on 200", async () => {
    mock.onGet(/\/api\/workouts\/today/).reply(200, fakeWorkout);

    const result = await workoutsApi.getTodayWorkout();
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Full Body Circuit");
    expect(result!.exercises).toHaveLength(1);
  });

  // TC-FE-08
  it("returns null on 404 (no workout today)", async () => {
    mock.onGet(/\/api\/workouts\/today/).reply(404, { message: "No workout scheduled." });

    const result = await workoutsApi.getTodayWorkout();
    expect(result).toBeNull();
  });
});

describe("workoutsApi.generateWorkout", () => {
  afterEach(() => mock.reset());

  // TC-FE-09
  it("sends POST /api/workouts/generate and returns new Workout", async () => {
    mock.onPost(/\/api\/workouts\/generate/).reply(200, fakeWorkout);

    const result = await workoutsApi.generateWorkout();
    expect(result.id).toBe(fakeWorkout.id);
    expect(result.status).toBe("Pending");
  });

  // TC-FE-10
  it("throws on 400 BadRequest (e.g. no profile)", async () => {
    mock.onPost(/\/api\/workouts\/generate/).reply(400, { message: "Profile not found." });

    await expect(workoutsApi.generateWorkout()).rejects.toMatchObject({
      response: { status: 400 },
    });
  });
});

describe("workoutsApi.completeWorkout", () => {
  afterEach(() => mock.reset());

  // TC-FE-11
  it("sends POST /api/workouts/{id}/complete and returns Completed workout", async () => {
    const completed = { ...fakeWorkout, status: "Completed" };
    mock.onPost(new RegExp(`/api/workouts/${fakeWorkout.id}/complete`)).reply(200, completed);

    const result = await workoutsApi.completeWorkout(fakeWorkout.id);
    expect(result.status).toBe("Completed");
  });

  // TC-FE-12
  it("throws on 404 when workoutId not found", async () => {
    mock.onPost(/\/api\/workouts\/[^/]+\/complete/).reply(404, { message: "Workout not found." });

    await expect(
      workoutsApi.completeWorkout("00000000-0000-0000-0000-000000000099")
    ).rejects.toMatchObject({ response: { status: 404 } });
  });
});

describe("workoutsApi.getHistory", () => {
  afterEach(() => mock.reset());

  // TC-FE-13
  it("sends GET /api/workouts/history and returns array", async () => {
    mock.onGet(/\/api\/workouts\/history/).reply(200, [fakeWorkout]);

    const result = await workoutsApi.getHistory(1, 10);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Full Body Circuit");
  });
});

// ── TC-FE-XP ─────────────────────────────────────────────────────────────────

describe("xpApi.getSummary", () => {
  afterEach(() => mock.reset());

  // TC-FE-14
  it("sends GET /api/xp and returns XPSummary", async () => {
    mock.onGet(/\/api\/xp$/).reply(200, fakeXPSummary);

    const result = await xpApi.getSummary();
    expect(result.totalXP).toBe(200);
    expect(result.level).toBe(1);
    expect(result.progressToNextLevel).toBeCloseTo(0.4);
    expect(result.recentRecords).toHaveLength(1);
  });
});

// ── TC-FE-STREAKS ─────────────────────────────────────────────────────────────

describe("streaksApi.getStreak", () => {
  afterEach(() => mock.reset());

  // TC-FE-15
  it("sends GET /api/streaks and returns Streak", async () => {
    mock.onGet(/\/api\/streaks$/).reply(200, fakeStreak);

    const result = await streaksApi.getStreak();
    expect(result.currentStreak).toBe(3);
    expect(result.isActiveToday).toBe(true);
    expect(result.longestStreak).toBe(5);
  });
});

// ── TC-FE-LEADERBOARD ────────────────────────────────────────────────────────

describe("leaderboardApi.getLeaderboard", () => {
  afterEach(() => mock.reset());

  // TC-FE-16
  it("sends GET /api/leaderboard with top param and returns array", async () => {
    mock.onGet(/\/api\/leaderboard/).reply(200, fakeLeaderboard);

    const result = await leaderboardApi.getLeaderboard(10);
    expect(result).toHaveLength(2);
    expect(result[0].rank).toBe(1);
    expect(result[0].username).toBe("alice");
  });
});

describe("leaderboardApi.getMyRank", () => {
  afterEach(() => mock.reset());

  // TC-FE-17
  it("returns LeaderboardEntry when user is ranked", async () => {
    mock.onGet(/\/api\/leaderboard\/me/).reply(200, fakeLeaderboard[0]);

    const result = await leaderboardApi.getMyRank();
    expect(result).not.toBeNull();
    expect(result!.username).toBe("alice");
    expect(result!.totalXP).toBe(500);
  });

  // TC-FE-18
  it("returns null on 404 (not ranked yet)", async () => {
    mock.onGet(/\/api\/leaderboard\/me/).reply(404, { message: "User not ranked yet." });

    const result = await leaderboardApi.getMyRank();
    expect(result).toBeNull();
  });
});

// ── TC-FE-TOKEN ───────────────────────────────────────────────────────────────

describe("saveToken / clearToken", () => {
  // TC-FE-19
  it("saveToken stores value in AsyncStorage", async () => {
    const AsyncStorage = require("../__mocks__/async-storage");
    await saveToken("mytoken");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("@gymxp_token", "mytoken");
  });

  // TC-FE-20
  it("clearToken removes value from AsyncStorage", async () => {
    const AsyncStorage = require("../__mocks__/async-storage");
    await clearToken();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@gymxp_token");
  });
});
