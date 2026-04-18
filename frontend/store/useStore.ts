import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, userProfileApi, workoutsApi, xpApi, streaksApi, leaderboardApi, saveToken, clearToken, getStoredToken } from "../services/api";
import type { AuthResponse, UserProfile, Workout, XPSummary, Streak, LeaderboardEntry } from "../types";

interface AuthState {
  token: string | null;
  userId: string | null;
  username: string | null;
  email: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface DataState {
  profile: UserProfile | null;
  todayWorkout: Workout | null;
  workoutHistory: Workout[];
  xpSummary: XPSummary | null;
  streak: Streak | null;
  leaderboard: LeaderboardEntry[];
  myRank: LeaderboardEntry | null;
}

interface Actions {
  // Auth
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;

  // Profile
  loadProfile: () => Promise<void>;
  upsertProfile: (data: any) => Promise<void>;

  // Workouts
  loadTodayWorkout: () => Promise<void>;
  loadWorkoutHistory: (page?: number) => Promise<void>;
  generateWorkout: () => Promise<void>;
  completeWorkout: (workoutId: string) => Promise<void>;

  // XP & Streaks
  loadXPSummary: () => Promise<void>;
  loadStreak: () => Promise<void>;

  // Leaderboard
  loadLeaderboard: () => Promise<void>;

  // Utility
  clearError: () => void;
}

type AppStore = AuthState & DataState & Actions;

const useStore = create<AppStore>((set, get) => ({
  // ---------- Initial State ----------
  token: null,
  userId: null,
  username: null,
  email: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  profile: null,
  todayWorkout: null,
  workoutHistory: [],
  xpSummary: null,
  streak: null,
  leaderboard: [],
  myRank: null,

  // ---------- Auth Actions ----------

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(email, password);
      await saveToken(res.token);
      set({
        token: res.token,
        userId: res.userId,
        username: res.username,
        email: res.email,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err?.response?.data?.message ?? "Login failed." });
      throw err;
    }
  },

  register: async (email, username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register(email, username, password);
      await saveToken(res.token);
      set({
        token: res.token,
        userId: res.userId,
        username: res.username,
        email: res.email,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err?.response?.data?.message ?? "Registration failed." });
      throw err;
    }
  },

  logout: async () => {
    await clearToken();
    set({
      token: null,
      userId: null,
      username: null,
      email: null,
      isAuthenticated: false,
      profile: null,
      todayWorkout: null,
      workoutHistory: [],
      xpSummary: null,
      streak: null,
      leaderboard: [],
      myRank: null,
    });
  },

  restoreSession: async () => {
    const token = await getStoredToken();
    if (token) {
      set({ token, isAuthenticated: true });
      // Load profile to get userId etc.
      try {
        const profile = await userProfileApi.getProfile();
        set({ profile, userId: profile.userId, username: profile.username, email: profile.email });
      } catch {
        // Profile not set up yet – still authenticated
      }
    }
  },

  // ---------- Profile Actions ----------

  loadProfile: async () => {
    try {
      const profile = await userProfileApi.getProfile();
      set({ profile });
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? "Failed to load profile." });
    }
  },

  upsertProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await userProfileApi.upsertProfile(data);
      set({ profile, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err?.response?.data?.message ?? "Failed to save profile." });
      throw err;
    }
  },

  // ---------- Workout Actions ----------

  loadTodayWorkout: async () => {
    try {
      const workout = await workoutsApi.getTodayWorkout();
      set({ todayWorkout: workout });
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? "Failed to load workout." });
    }
  },

  loadWorkoutHistory: async (page = 1) => {
    try {
      const history = await workoutsApi.getHistory(page);
      set({ workoutHistory: history });
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? "Failed to load history." });
    }
  },

  generateWorkout: async () => {
    set({ isLoading: true, error: null });
    try {
      const workout = await workoutsApi.generateWorkout();
      set({ todayWorkout: workout, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err?.response?.data?.message ?? "Failed to generate workout." });
      throw err;
    }
  },

  completeWorkout: async (workoutId) => {
    set({ isLoading: true, error: null });
    try {
      const workout = await workoutsApi.completeWorkout(workoutId);
      set({ todayWorkout: workout, isLoading: false });
      // Refresh XP and streak
      get().loadXPSummary();
      get().loadStreak();
    } catch (err: any) {
      set({ isLoading: false, error: err?.response?.data?.message ?? "Failed to complete workout." });
      throw err;
    }
  },

  // ---------- XP & Streak Actions ----------

  loadXPSummary: async () => {
    try {
      const xpSummary = await xpApi.getSummary();
      set({ xpSummary });
    } catch {
      // silently fail – not critical
    }
  },

  loadStreak: async () => {
    try {
      const streak = await streaksApi.getStreak();
      set({ streak });
    } catch {
      // silently fail
    }
  },

  // ---------- Leaderboard ----------

  loadLeaderboard: async () => {
    try {
      const [leaderboard, myRank] = await Promise.all([
        leaderboardApi.getLeaderboard(),
        leaderboardApi.getMyRank(),
      ]);
      set({ leaderboard, myRank });
    } catch {
      // silently fail
    }
  },

  // ---------- Utility ----------
  clearError: () => set({ error: null }),
}));

export default useStore;
