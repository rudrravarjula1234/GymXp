import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useStore from "../../store/useStore";
import XPProgressBar from "../../components/XPProgressBar";
import StreakTracker from "../../components/StreakTracker";
import WorkoutCard from "../../components/WorkoutCard";
import { COLORS } from "../../constants";

/**
 * Progress screen shows XP history, streak stats, and past workouts.
 */
export default function ProgressScreen() {
  const {
    xpSummary,
    streak,
    workoutHistory,
    isLoading,
    loadXPSummary,
    loadStreak,
    loadWorkoutHistory,
  } = useStore();

  useEffect(() => {
    loadXPSummary();
    loadStreak();
    loadWorkoutHistory();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>📈 Your Progress</Text>

        {/* XP Progress */}
        {xpSummary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>XP & Level</Text>
            <XPProgressBar
              totalXP={xpSummary.totalXP}
              level={xpSummary.level}
              progressToNextLevel={xpSummary.progressToNextLevel}
              xpRequiredForNextLevel={xpSummary.xpRequiredForNextLevel}
            />

            {/* Recent XP records */}
            {xpSummary.recentRecords.length > 0 && (
              <View style={styles.recentXP}>
                <Text style={styles.subTitle}>Recent XP earned</Text>
                {xpSummary.recentRecords.map((r, i) => (
                  <View key={i} style={styles.xpRecord}>
                    <Text style={styles.xpRecordReason}>{r.reason}</Text>
                    <Text style={styles.xpRecordPoints}>+{r.pointsEarned} XP</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          isLoading && <ActivityIndicator color={COLORS.primary} />
        )}

        {/* Streak */}
        {streak && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Streak</Text>
            <StreakTracker
              currentStreak={streak.currentStreak}
              longestStreak={streak.longestStreak}
              isActiveToday={streak.isActiveToday}
              lastActivityDate={streak.lastActivityDate}
            />
          </View>
        )}

        {/* Workout History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout History</Text>
          {workoutHistory.length === 0 ? (
            <Text style={styles.emptyText}>No workouts completed yet.</Text>
          ) : (
            workoutHistory.map((w) => (
              <WorkoutCard key={w.id} workout={w} showActions={false} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  screenTitle: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: "800",
  },
  section: { gap: 12 },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  subTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  recentXP: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  xpRecord: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  xpRecordReason: { color: COLORS.textPrimary, fontSize: 14, flex: 1 },
  xpRecordPoints: { color: COLORS.xpGold, fontWeight: "700", fontSize: 14 },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
});
