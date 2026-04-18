import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Workout } from "../types";
import { COLORS } from "../constants";

interface WorkoutCardProps {
  workout: Workout;
  onComplete?: (workoutId: string) => void;
  onPress?: (workout: Workout) => void;
  showActions?: boolean;
}

/**
 * Displays a workout summary card with exercises count, XP reward, and status.
 */
const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onComplete,
  onPress,
  showActions = true,
}) => {
  const statusColor: Record<string, string> = {
    Pending: COLORS.textSecondary,
    InProgress: COLORS.accent,
    Completed: COLORS.success,
    Skipped: COLORS.error,
  };

  const isCompleted = workout.status === "Completed";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(workout)}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {workout.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor[workout.status] + "33" }]}>
            <Text style={[styles.statusText, { color: statusColor[workout.status] }]}>
              {workout.status}
            </Text>
          </View>
        </View>

        {/* XP reward */}
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>🏆</Text>
          <Text style={styles.xpValue}>{workout.xpReward} XP</Text>
        </View>
      </View>

      {/* Motivation message */}
      {workout.motivationMessage ? (
        <Text style={styles.motivation} numberOfLines={2}>
          💬 {workout.motivationMessage}
        </Text>
      ) : null}

      {/* Exercise count */}
      <Text style={styles.exerciseCount}>
        {workout.exercises.length} exercise{workout.exercises.length !== 1 ? "s" : ""}
      </Text>

      {/* Complete button */}
      {showActions && !isCompleted && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => onComplete?.(workout.id)}
          activeOpacity={0.85}
        >
          <Text style={styles.completeButtonText}>Mark as Complete ✓</Text>
        </TouchableOpacity>
      )}

      {isCompleted && (
        <View style={styles.completedBanner}>
          <Text style={styles.completedText}>✅ Workout Completed!</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  xpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  xpLabel: {
    fontSize: 14,
  },
  xpValue: {
    color: COLORS.xpGold,
    fontWeight: "600",
    fontSize: 14,
  },
  motivation: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontStyle: "italic",
    lineHeight: 18,
  },
  exerciseCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  completeButtonText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  completedBanner: {
    backgroundColor: COLORS.success + "22",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 4,
  },
  completedText: {
    color: COLORS.success,
    fontWeight: "600",
    fontSize: 14,
  },
});

export default WorkoutCard;
