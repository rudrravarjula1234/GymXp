import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import useStore from "../store/useStore";
import { COLORS } from "../constants";

export default function RootLayout() {
  const { isAuthenticated, restoreSession } = useStore();

  useEffect(() => {
    restoreSession().then(() => {
      if (!isAuthenticated) {
        router.replace("/onboarding");
      }
    });
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.textPrimary,
          contentStyle: { backgroundColor: COLORS.background },
          headerShown: false,
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
