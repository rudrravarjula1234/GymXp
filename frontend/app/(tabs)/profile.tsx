import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import useStore from "../../store/useStore";
import { COLORS, FITNESS_GOAL_LABELS, EXPERIENCE_LEVEL_LABELS } from "../../constants";
import { FitnessGoal, ExperienceLevel } from "../../types";

/**
 * Profile screen for viewing and editing user profile data.
 * Also provides a logout button.
 */
export default function ProfileScreen() {
  const { profile, isLoading, loadProfile, upsertProfile, logout, username, error, clearError } = useStore();

  const [editing, setEditing] = useState(false);
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [goal, setGoal] = useState<FitnessGoal>(FitnessGoal.GeneralFitness);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(ExperienceLevel.Beginner);
  const [availableEquipment, setAvailableEquipment] = useState("park gym");
  const [availableTimeMinutes, setAvailableTimeMinutes] = useState("45");

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setWeightKg(String(profile.weightKg));
      setHeightCm(String(profile.heightCm));
      setAgeYears(String(profile.ageYears));
      setAvailableEquipment(profile.availableEquipment);
      setAvailableTimeMinutes(String(profile.availableTimeMinutes));
    }
  }, [profile]);

  const handleSave = async () => {
    clearError();
    const request = {
      weightKg: parseFloat(weightKg) || 70,
      heightCm: parseFloat(heightCm) || 170,
      ageYears: parseInt(ageYears) || 25,
      goal,
      experienceLevel,
      availableEquipment,
      availableTimeMinutes: parseInt(availableTimeMinutes) || 45,
    };
    try {
      await upsertProfile(request);
      setEditing(false);
    } catch {
      Alert.alert("Error", error ?? "Failed to save profile.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/onboarding");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>💪</Text>
          </View>
          <Text style={styles.displayName}>{username ?? "Athlete"}</Text>
          {profile && (
            <Text style={styles.profileSub}>
              Level {profile.level} • {profile.totalXP.toLocaleString()} XP
            </Text>
          )}
        </View>

        {/* Stats row */}
        {profile && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.currentStreak}d</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.totalXP.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>
        )}

        {/* Profile form / view */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Details</Text>
            <TouchableOpacity onPress={() => setEditing((v) => !v)}>
              <Text style={styles.editBtn}>{editing ? "Cancel" : "Edit"}</Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <View style={styles.form}>
              <LabeledInput label="Weight (kg)" value={weightKg} onChange={setWeightKg} keyboardType="decimal-pad" />
              <LabeledInput label="Height (cm)" value={heightCm} onChange={setHeightCm} keyboardType="decimal-pad" />
              <LabeledInput label="Age" value={ageYears} onChange={setAgeYears} keyboardType="number-pad" />
              <LabeledInput label="Equipment" value={availableEquipment} onChange={setAvailableEquipment} />
              <LabeledInput label="Time available (min)" value={availableTimeMinutes} onChange={setAvailableTimeMinutes} keyboardType="number-pad" />

              {/* Goal picker */}
              <Text style={styles.pickerLabel}>Fitness Goal</Text>
              <View style={styles.pickerRow}>
                {Object.entries(FitnessGoal)
                  .filter(([, v]) => typeof v === "number")
                  .map(([key, val]) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.chip, goal === val && styles.chipActive]}
                      onPress={() => setGoal(val as FitnessGoal)}
                    >
                      <Text style={[styles.chipText, goal === val && styles.chipTextActive]}>
                        {FITNESS_GOAL_LABELS[key] ?? key}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>

              {/* Experience picker */}
              <Text style={styles.pickerLabel}>Experience Level</Text>
              <View style={styles.pickerRow}>
                {Object.entries(ExperienceLevel)
                  .filter(([, v]) => typeof v === "number")
                  .map(([key, val]) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.chip, experienceLevel === val && styles.chipActive]}
                      onPress={() => setExperienceLevel(val as ExperienceLevel)}
                    >
                      <Text style={[styles.chipText, experienceLevel === val && styles.chipTextActive]}>
                        {EXPERIENCE_LEVEL_LABELS[key] ?? key}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, isLoading && styles.disabled]}
                onPress={handleSave}
                disabled={isLoading}
              >
                <Text style={styles.saveBtnText}>
                  {isLoading ? "Saving..." : "Save Profile"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileView}>
              {profile ? (
                <>
                  <ProfileRow label="Weight" value={`${profile.weightKg} kg`} />
                  <ProfileRow label="Height" value={`${profile.heightCm} cm`} />
                  <ProfileRow label="Age" value={`${profile.ageYears} yrs`} />
                  <ProfileRow label="Goal" value={FITNESS_GOAL_LABELS[profile.goal] ?? profile.goal} />
                  <ProfileRow label="Experience" value={profile.experienceLevel} />
                  <ProfileRow label="Equipment" value={profile.availableEquipment} />
                  <ProfileRow label="Session Time" value={`${profile.availableTimeMinutes} min`} />
                </>
              ) : (
                <Text style={styles.noProfile}>
                  Tap Edit to set up your profile and get AI-generated workouts!
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper sub-components
const LabeledInput = ({
  label,
  value,
  onChange,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: any;
}) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      keyboardType={keyboardType}
      placeholderTextColor={COLORS.textSecondary}
    />
  </View>
);

const ProfileRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.profileRow}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: 20, gap: 20, paddingBottom: 40 },

  avatarSection: { alignItems: "center", gap: 8 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: { fontSize: 36 },
  displayName: { color: COLORS.textPrimary, fontSize: 22, fontWeight: "700" },
  profileSub: { color: COLORS.textSecondary, fontSize: 13 },

  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center", gap: 4 },
  statValue: { color: COLORS.textPrimary, fontWeight: "700", fontSize: 18 },
  statLabel: { color: COLORS.textSecondary, fontSize: 12 },

  section: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { color: COLORS.textPrimary, fontWeight: "700", fontSize: 16 },
  editBtn: { color: COLORS.primary, fontWeight: "600", fontSize: 14 },

  form: { gap: 12 },
  inputWrapper: { gap: 6 },
  inputLabel: { color: COLORS.textSecondary, fontSize: 13 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerLabel: { color: COLORS.textSecondary, fontSize: 13 },
  pickerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: 13 },
  chipTextActive: { color: COLORS.textPrimary, fontWeight: "600" },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  disabled: { opacity: 0.6 },
  saveBtnText: { color: COLORS.textPrimary, fontWeight: "700", fontSize: 15 },

  profileView: { gap: 10 },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLabel: { color: COLORS.textSecondary, fontSize: 14 },
  rowValue: { color: COLORS.textPrimary, fontWeight: "600", fontSize: 14 },
  noProfile: { color: COLORS.textSecondary, fontSize: 14, textAlign: "center", lineHeight: 22 },

  logoutBtn: {
    backgroundColor: COLORS.error + "22",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.error + "55",
  },
  logoutText: { color: COLORS.error, fontWeight: "700", fontSize: 15 },
});
