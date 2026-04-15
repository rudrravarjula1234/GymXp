import axios, { AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import type {
  AuthResponse,
  UserProfile,
  Workout,
  XPSummary,
  Streak,
  LeaderboardEntry,
  UpsertProfileRequest,
} from "../types";

// Base URL from app.json extra config or fallback
const API_BASE_URL =
  Constants.expoConfig?.extra?.API_BASE_URL ?? "http://localhost:5000";

const TOKEN_KEY = "@gymxp_token";

// ---------- Axios instance ----------

const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach stored JWT to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- Token helpers ----------

export const saveToken = (token: string) =>
  AsyncStorage.setItem(TOKEN_KEY, token);

export const clearToken = () => AsyncStorage.removeItem(TOKEN_KEY);

export const getStoredToken = () => AsyncStorage.getItem(TOKEN_KEY);

// ---------- Auth ----------

export const authApi = {
  register: async (email: string, username: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      email,
      username,
      password,
    });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },
};

// ---------- User Profile ----------

export const userProfileApi = {
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await api.get<UserProfile>("/user-profile");
    return data;
  },

  upsertProfile: async (request: UpsertProfileRequest): Promise<UserProfile> => {
    const { data } = await api.put<UserProfile>("/user-profile", request);
    return data;
  },
};

// ---------- Workouts ----------

export const workoutsApi = {
  getTodayWorkout: async (): Promise<Workout | null> => {
    try {
      const { data } = await api.get<Workout>("/workouts/today");
      return data;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  getHistory: async (page = 1, pageSize = 10): Promise<Workout[]> => {
    const { data } = await api.get<Workout[]>("/workouts/history", {
      params: { page, pageSize },
    });
    return data;
  },

  generateWorkout: async (): Promise<Workout> => {
    const { data } = await api.post<Workout>("/workouts/generate");
    return data;
  },

  completeWorkout: async (workoutId: string): Promise<Workout> => {
    const { data } = await api.post<Workout>(`/workouts/${workoutId}/complete`);
    return data;
  },
};

// ---------- XP ----------

export const xpApi = {
  getSummary: async (): Promise<XPSummary> => {
    const { data } = await api.get<XPSummary>("/xp");
    return data;
  },
};

// ---------- Streaks ----------

export const streaksApi = {
  getStreak: async (): Promise<Streak> => {
    const { data } = await api.get<Streak>("/streaks");
    return data;
  },
};

// ---------- Leaderboard ----------

export const leaderboardApi = {
  getLeaderboard: async (top = 10): Promise<LeaderboardEntry[]> => {
    const { data } = await api.get<LeaderboardEntry[]>("/leaderboard", {
      params: { top },
    });
    return data;
  },

  getMyRank: async (): Promise<LeaderboardEntry | null> => {
    try {
      const { data } = await api.get<LeaderboardEntry>("/leaderboard/me");
      return data;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },
};

export default api;
