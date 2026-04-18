import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, getLevelTitle } from "../constants";

interface XPProgressBarProps {
  totalXP: number;
  level: number;
  progressToNextLevel: number;
  xpRequiredForNextLevel: number;
}

/**
 * Displays the user's current XP, level, and progress bar toward the next level.
 */
const XPProgressBar: React.FC<XPProgressBarProps> = ({
  totalXP,
  level,
  progressToNextLevel,
  xpRequiredForNextLevel,
}) => {
  const clampedProgress = Math.min(Math.max(progressToNextLevel, 0), 1);
  const levelTitle = getLevelTitle(level);

  return (
    <View style={styles.container}>
      {/* Level badge + title */}
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>{level}</Text>
        </View>
        <View style={styles.levelInfo}>
          <Text style={styles.levelTitle}>{levelTitle}</Text>
          <Text style={styles.xpText}>{totalXP.toLocaleString()} XP</Text>
        </View>
        <Text style={styles.nextLevel}>→ Lvl {level + 1}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${clampedProgress * 100}%` as any }]} />
      </View>

      {/* XP label */}
      <Text style={styles.progressLabel}>
        {Math.round(clampedProgress * xpRequiredForNextLevel)}/{xpRequiredForNextLevel} XP to next level
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  levelNumber: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 18,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    color: COLORS.xpGold,
    fontWeight: "600",
    fontSize: 14,
  },
  xpText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  nextLevel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  barBackground: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: COLORS.xpGold,
    borderRadius: 5,
  },
  progressLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: "right",
  },
});

export default XPProgressBar;
