import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useStore from "../store/useStore";
import { COLORS } from "../constants";

type AuthMode = "login" | "register";

/**
 * Onboarding screen handles both login and registration.
 * After authentication, navigates to the main dashboard.
 */
export default function OnboardingScreen() {
  const { login, register, isLoading, error, clearError } = useStore();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    clearError();
    if (!email || !password || (mode === "register" && !username)) {
      Alert.alert("Validation", "Please fill in all fields.");
      return;
    }
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, username, password);
      }
      router.replace("/(tabs)");
    } catch {
      // error already set in store
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Logo / Hero */}
          <View style={styles.hero}>
            <Text style={styles.logo}>💪</Text>
            <Text style={styles.appName}>GymXP</Text>
            <Text style={styles.tagline}>Level up your fitness journey</Text>
          </View>

          {/* Mode toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === "login" && styles.modeBtnActive]}
              onPress={() => setMode("login")}
            >
              <Text style={[styles.modeBtnText, mode === "login" && styles.modeBtnTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === "register" && styles.modeBtnActive]}
              onPress={() => setMode("register")}
            >
              <Text style={[styles.modeBtnText, mode === "register" && styles.modeBtnTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {mode === "register" && (
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={COLORS.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitBtnText}>
                {isLoading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    gap: 28,
  },
  hero: {
    alignItems: "center",
    gap: 8,
  },
  logo: { fontSize: 64 },
  appName: {
    color: COLORS.textPrimary,
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 2,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  modeBtnActive: { backgroundColor: COLORS.primary },
  modeBtnText: { color: COLORS.textSecondary, fontWeight: "600" },
  modeBtnTextActive: { color: COLORS.textPrimary },
  form: { gap: 14 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    color: COLORS.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    textAlign: "center",
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 17,
  },
});
