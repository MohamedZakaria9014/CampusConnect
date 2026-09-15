import React from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { useThemeStore } from "../../src/store/useThemeStore";

export default function OnboardingLayout() {
  const colors = useThemeStore((s) => s.colors);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: Platform.OS === "ios" ? "default" : "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
