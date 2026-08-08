import React from 'react';
import { Stack } from 'expo-router';
import { useThemeStore } from '../../src/store/useThemeStore';

export default function MainLayout() {
  const { colors } = useThemeStore();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Base Tabs Navigator Group (Feed, Explore, Ask, Messages, Profile) */}
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false, gestureEnabled: false, animation: 'none' }}
      />

      {/* Modal & Stack Sub-pages with Native iOS Swipe-Back Gesture */}
      <Stack.Screen
        name="ask"
        options={{ animation: 'slide_from_bottom', gestureEnabled: true }}
      />
      <Stack.Screen
        name="post/[id]"
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="messages/[id]"
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="profile/settings"
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="notifications"
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="explore/university/[id]"
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
    </Stack>
  );
}
