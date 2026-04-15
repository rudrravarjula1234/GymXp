import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, getLevelTitle } from "../constants";
import type { LeaderboardEntry } from "../types";

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

/**
 * Renders a single leaderboard row with rank, username, XP, level, and streak.
 */
const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  entry,
  isCurrentUser = false,
}) => {
  const rankMedal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : null;

  return (
    <View style={[styles.card, isCurrentUser && styles.currentUserCard]}>
      {/* Rank */}
      <View style={styles.rankContainer}>
        {rankMedal ? (
          <Text style={styles.medal}>{rankMedal}</Text>
        ) : (
          <Text style={styles.rank}>#{entry.rank}</Text>
        )}
      </View>

      {/* User info */}
      <View style={styles.userInfo}>
        <Text style={styles.username} numberOfLines={1}>
          {entry.username}
          {isCurrentUser && <Text style={styles.youBadge}> (You)</Text>}
        </Text>
        <Text style={styles.levelTitle}>{getLevelTitle(entry.level)} • Lvl {entry.level}</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.xp}>{entry.totalXP.toLocaleString()} XP</Text>
        <Text style={styles.streak}>🔥 {entry.currentStreak}d</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currentUserCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "22",
  },
  rankContainer: {
    width: 36,
    alignItems: "center",
  },
  medal: {
    fontSize: 22,
  },
  rank: {
    color: COLORS.textSecondary,
    fontWeight: "700",
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  username: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  youBadge: {
    color: COLORS.primary,
    fontSize: 13,
  },
  levelTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  stats: {
    alignItems: "flex-end",
    gap: 4,
  },
  xp: {
    color: COLORS.xpGold,
    fontWeight: "700",
    fontSize: 14,
  },
  streak: {
    color: COLORS.streakFire,
    fontSize: 12,
    fontWeight: "600",
  },
});

export default LeaderboardCard;
