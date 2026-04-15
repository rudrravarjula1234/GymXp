import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useStore from "../../store/useStore";
import LeaderboardCard from "../../components/LeaderboardCard";
import { COLORS } from "../../constants";

/**
 * Leaderboard screen shows the top users ranked by total XP.
 */
export default function LeaderboardScreen() {
  const { leaderboard, myRank, isLoading, loadLeaderboard, userId } = useStore();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadLeaderboard}
            tintColor={COLORS.primary}
          />
        }
      >
        <Text style={styles.screenTitle}>🏆 Leaderboard</Text>

        {/* User's own rank */}
        {myRank && (
          <View style={styles.myRankSection}>
            <Text style={styles.sectionLabel}>Your Rank</Text>
            <LeaderboardCard
              entry={myRank}
              isCurrentUser
            />
          </View>
        )}

        {/* Top users */}
        {isLoading && leaderboard.length === 0 ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        ) : leaderboard.length === 0 ? (
          <Text style={styles.emptyText}>No rankings yet. Complete workouts to earn XP!</Text>
        ) : (
          <View style={styles.list}>
            {leaderboard.map((entry) => (
              <LeaderboardCard
                key={entry.userId}
                entry={entry}
                isCurrentUser={entry.userId === userId}
              />
            ))}
          </View>
        )}
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
  myRankSection: { gap: 8 },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  loader: { marginTop: 40 },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
  list: { gap: 10 },
});
