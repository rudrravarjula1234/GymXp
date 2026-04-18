import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import useStore from "../../store/useStore";
import XPProgressBar from "../../components/XPProgressBar";
import StreakTracker from "../../components/StreakTracker";
import WorkoutCard from "../../components/WorkoutCard";
import { COLORS } from "../../constants";

/**
 * Dashboard – the main home screen showing XP, streak, and today's workout.
 */
export default function DashboardScreen() {
  const {
    username,
    profile,
    todayWorkout,
    xpSummary,
    streak,
    isLoading,
    loadProfile,
    loadTodayWorkout,
    loadXPSummary,
    loadStreak,
    generateWorkout,
    completeWorkout,
  } = useStore();

  const loadDashboardData = useCallback(async () => {
    await Promise.all([loadProfile(), loadTodayWorkout(), loadXPSummary(), loadStreak()]);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleGenerateWorkout = async () => {
    try {
      await generateWorkout();
    } catch {
      // error handled in store
    }
  };

  const handleCompleteWorkout = async (workoutId: string) => {
    try {
      await completeWorkout(workoutId);
    } catch {
      // error handled in store
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadDashboardData}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey, {username ?? "Athlete"} 👋</Text>
            <Text style={styles.subGreeting}>Ready to level up today?</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lvl {xpSummary?.level ?? 1}</Text>
          </View>
        </View>

        {/* XP Progress */}
        {xpSummary && (
          <XPProgressBar
            totalXP={xpSummary.totalXP}
            level={xpSummary.level}
            progressToNextLevel={xpSummary.progressToNextLevel}
            xpRequiredForNextLevel={xpSummary.xpRequiredForNextLevel}
          />
        )}

        {/* Streak */}
        {streak && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Streak</Text>
            <StreakTracker
              currentStreak={streak.currentStreak}
              longestStreak={streak.longestStreak}
              isActiveToday={streak.isActiveToday}
              lastActivityDate={streak.lastActivityDate}
            />
          </View>
        )}

        {/* Today's Workout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💪 Today's Workout</Text>

          {isLoading && !todayWorkout ? (
            <ActivityIndicator color={COLORS.primary} style={styles.loader} />
          ) : todayWorkout ? (
            <WorkoutCard
              workout={todayWorkout}
              onComplete={handleCompleteWorkout}
              onPress={() => router.push("/(tabs)/workout")}
            />
          ) : (
            <View style={styles.noWorkout}>
              <Text style={styles.noWorkoutText}>No workout generated yet.</Text>
              <TouchableOpacity
                style={styles.generateBtn}
                onPress={handleGenerateWorkout}
                disabled={isLoading}
              >
                <Text style={styles.generateBtnText}>
                  {isLoading ? "Generating..." : "Generate Today's Workout ✨"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        {profile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Quick Stats</Text>
            <View style={styles.statsGrid}>
              <StatCard label="Goal" value={profile.goal.replace(/([A-Z])/g, " $1").trim()} />
              <StatCard label="Level" value={`${xpSummary?.level ?? 1}`} />
              <StatCard label="Total XP" value={(xpSummary?.totalXP ?? 0).toLocaleString()} />
              <StatCard label="Streak" value={`${streak?.currentStreak ?? 0}d`} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Small helper component for quick stats
const StatCard = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "800",
  },
  subGreeting: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  levelBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  levelBadgeText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 14,
  },
  section: { gap: 12 },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  loader: { marginVertical: 20 },
  noWorkout: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noWorkoutText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  generateBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  generateBtnText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});
