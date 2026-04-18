import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useStore from "../../store/useStore";
import { COLORS } from "../../constants";
import type { Exercise } from "../../types";

/**
 * Workout screen shows today's workout exercises in detail,
 * allowing the user to mark individual exercises complete.
 */
export default function WorkoutScreen() {
  const {
    todayWorkout,
    isLoading,
    loadTodayWorkout,
    generateWorkout,
    completeWorkout,
    error,
  } = useStore();

  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTodayWorkout();
  }, []);

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises((prev) => {
      const next = new Set(prev);
      next.has(exerciseId) ? next.delete(exerciseId) : next.add(exerciseId);
      return next;
    });
  };

  const handleComplete = async () => {
    if (!todayWorkout) return;
    Alert.alert(
      "Complete Workout",
      `You'll earn ${todayWorkout.xpReward} XP. Are you ready?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            try {
              await completeWorkout(todayWorkout.id);
            } catch {
              Alert.alert("Error", "Failed to complete workout. Try again.");
            }
          },
        },
      ]
    );
  };

  if (isLoading && !todayWorkout) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {todayWorkout ? (
          <>
            {/* Title */}
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{todayWorkout.title}</Text>
              <Text style={styles.subtitle}>{todayWorkout.description}</Text>
              {todayWorkout.motivationMessage ? (
                <View style={styles.motivationBox}>
                  <Text style={styles.motivationText}>
                    💬 {todayWorkout.motivationMessage}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* XP reward */}
            <View style={styles.xpRow}>
              <Text style={styles.xpIcon}>🏆</Text>
              <Text style={styles.xpText}>{todayWorkout.xpReward} XP on completion</Text>
            </View>

            {/* Exercises */}
            <Text style={styles.sectionTitle}>Exercises</Text>
            {todayWorkout.exercises.map((exercise) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                done={completedExercises.has(exercise.id)}
                onToggle={toggleExercise}
              />
            ))}

            {/* Complete button */}
            {todayWorkout.status !== "Completed" ? (
              <TouchableOpacity
                style={[styles.completeBtn, isLoading && styles.disabled]}
                onPress={handleComplete}
                disabled={isLoading}
              >
                <Text style={styles.completeBtnText}>
                  {isLoading ? "Saving..." : "Complete Workout 🎉"}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.completedBanner}>
                <Text style={styles.completedText}>✅ Workout Completed!</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyTitle}>No workout for today</Text>
            <Text style={styles.emptySubtitle}>
              Generate a workout to get started
            </Text>
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={generateWorkout}
              disabled={isLoading}
            >
              <Text style={styles.generateBtnText}>
                {isLoading ? "Generating..." : "Generate Workout ✨"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Exercise row sub-component
const ExerciseRow = ({
  exercise,
  done,
  onToggle,
}: {
  exercise: Exercise;
  done: boolean;
  onToggle: (id: string) => void;
}) => (
  <TouchableOpacity
    style={[styles.exerciseCard, done && styles.exerciseCardDone]}
    onPress={() => onToggle(exercise.id)}
    activeOpacity={0.8}
  >
    <View style={styles.exerciseCheck}>
      <Text style={{ fontSize: 18 }}>{done ? "✅" : "⬜"}</Text>
    </View>
    <View style={styles.exerciseInfo}>
      <Text style={[styles.exerciseName, done && styles.exerciseNameDone]}>
        {exercise.name}
      </Text>
      <Text style={styles.exerciseMuscle}>{exercise.muscleGroup}</Text>
      {exercise.description ? (
        <Text style={styles.exerciseDesc} numberOfLines={1}>
          {exercise.description}
        </Text>
      ) : null}
    </View>
    <View style={styles.exerciseStats}>
      {exercise.sets > 0 && exercise.reps > 0 ? (
        <Text style={styles.exerciseStat}>{exercise.sets}×{exercise.reps}</Text>
      ) : exercise.durationSeconds > 0 ? (
        <Text style={styles.exerciseStat}>{exercise.durationSeconds}s</Text>
      ) : null}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  loader: { marginTop: 80 },
  titleBlock: { gap: 6 },
  title: { color: COLORS.textPrimary, fontSize: 26, fontWeight: "800" },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
  motivationBox: {
    backgroundColor: COLORS.primary + "22",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  motivationText: { color: COLORS.primary, fontSize: 13, fontStyle: "italic" },
  xpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
  },
  xpIcon: { fontSize: 18 },
  xpText: { color: COLORS.xpGold, fontWeight: "700", fontSize: 15 },
  sectionTitle: { color: COLORS.textPrimary, fontWeight: "700", fontSize: 18 },
  exerciseCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exerciseCardDone: { opacity: 0.6 },
  exerciseCheck: { width: 28 },
  exerciseInfo: { flex: 1, gap: 2 },
  exerciseName: {
    color: COLORS.textPrimary,
    fontWeight: "600",
    fontSize: 15,
  },
  exerciseNameDone: { textDecorationLine: "line-through" },
  exerciseMuscle: { color: COLORS.primary, fontSize: 12, fontWeight: "500" },
  exerciseDesc: { color: COLORS.textSecondary, fontSize: 12 },
  exerciseStats: { alignItems: "flex-end" },
  exerciseStat: { color: COLORS.xpGold, fontWeight: "700", fontSize: 14 },
  completeBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  disabled: { opacity: 0.6 },
  completeBtnText: { color: COLORS.textPrimary, fontWeight: "700", fontSize: 16 },
  completedBanner: {
    backgroundColor: COLORS.success + "22",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  completedText: { color: COLORS.success, fontWeight: "700", fontSize: 16 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 80,
  },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: "700" },
  emptySubtitle: { color: COLORS.textSecondary, fontSize: 14 },
  generateBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  generateBtnText: { color: COLORS.textPrimary, fontWeight: "700", fontSize: 15 },
});
