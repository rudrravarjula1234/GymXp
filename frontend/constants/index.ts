// App-wide design tokens and constants

export const COLORS = {
  background: "#0A0A0F",
  surface: "#13131A",
  card: "#1C1C27",
  primary: "#7B5EA7",
  accent: "#FF6B35",
  xpGold: "#FFD700",
  streakFire: "#FF4500",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0B0",
  success: "#4CAF50",
  error: "#F44336",
  border: "#2A2A3A",
} as const;

export const LEVEL_TITLES: Record<number, string> = {
  1: "Newcomer",
  2: "Beginner",
  3: "Rookie",
  4: "Athlete",
  5: "Champion",
  6: "Elite",
  7: "Legend",
  8: "Master",
  9: "Grand Master",
  10: "GymXP God",
};

export const getLevelTitle = (level: number): string =>
  LEVEL_TITLES[Math.min(level, 10)] ?? "GymXP God";

export const XP_PER_LEVEL = 500;

export const FITNESS_GOAL_LABELS: Record<string, string> = {
  WeightLoss: "Weight Loss",
  MuscleGain: "Muscle Gain",
  Endurance: "Endurance",
  Flexibility: "Flexibility",
  GeneralFitness: "General Fitness",
};

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  Beginner: "Beginner",
  Intermediate: "Intermediate",
  Advanced: "Advanced",
};
