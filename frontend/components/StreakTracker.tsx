import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants";

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
  lastActivityDate?: string | null;
}

/**
 * Displays the user's current and longest streak with a flame indicator.
 */
const StreakTracker: React.FC<StreakTrackerProps> = ({
  currentStreak,
  longestStreak,
  isActiveToday,
  lastActivityDate,
}) => {
  const flameColor = isActiveToday ? COLORS.streakFire : COLORS.textSecondary;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Flame and streak count */}
      <View style={styles.mainRow}>
        <Text style={[styles.flame, { color: flameColor }]}>🔥</Text>
        <View>
          <Text style={[styles.streakCount, { color: flameColor }]}>
            {currentStreak}
          </Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
        {isActiveToday && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>Active today</Text>
          </View>
        )}
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{longestStreak}</Text>
          <Text style={styles.statLabel}>Best streak</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDate(lastActivityDate)}</Text>
          <Text style={styles.statLabel}>Last active</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flame: {
    fontSize: 36,
  },
  streakCount: {
    fontSize: 32,
    fontWeight: "800",
  },
  streakLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  activeBadge: {
    marginLeft: "auto",
    backgroundColor: COLORS.streakFire + "33",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeText: {
    color: COLORS.streakFire,
    fontSize: 12,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
});

export default StreakTracker;
