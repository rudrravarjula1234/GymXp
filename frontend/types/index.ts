// Core types shared across the application

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  userId: string;
}

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  weightKg: number;
  heightCm: number;
  ageYears: number;
  goal: string;
  experienceLevel: string;
  availableEquipment: string;
  availableTimeMinutes: number;
  totalXP: number;
  level: number;
  currentStreak: number;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: number;
  durationSeconds: number;
  muscleGroup: string;
  orderIndex: number;
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  motivationMessage: string;
  scheduledDate: string;
  status: "Pending" | "InProgress" | "Completed" | "Skipped";
  xpReward: number;
  exercises: Exercise[];
}

export interface XPSummary {
  userId: string;
  totalXP: number;
  level: number;
  xpForCurrentLevel: number;
  xpRequiredForNextLevel: number;
  progressToNextLevel: number;
  recentRecords: XPRecord[];
}

export interface XPRecord {
  pointsEarned: number;
  reason: string;
  earnedAt: string;
}

export interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  isActiveToday: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalXP: number;
  level: number;
  currentStreak: number;
}

export interface UpsertProfileRequest {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  goal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  availableEquipment: string;
  availableTimeMinutes: number;
}

export enum FitnessGoal {
  WeightLoss = 0,
  MuscleGain = 1,
  Endurance = 2,
  Flexibility = 3,
  GeneralFitness = 4,
}

export enum ExperienceLevel {
  Beginner = 0,
  Intermediate = 1,
  Advanced = 2,
}
