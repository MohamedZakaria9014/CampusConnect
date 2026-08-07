import React from 'react';
import { Stack } from 'expo-router';
import { useThemeStore } from '../../src/store/useThemeStore';

export default function OnboardingLayout() {
  const { colors } = useThemeStore();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
