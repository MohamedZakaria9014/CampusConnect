import React from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useThemeStore } from '../../src/store/useThemeStore';

export default function MainLayout() {
  const colors = useThemeStore((s) => s.colors);
  const defaultAnimation = Platform.OS === 'ios' ? 'default' : 'slide_from_right';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: defaultAnimation,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Base Tabs Navigator Group (Feed, Explore, Ask, Messages, Profile) */}
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false, gestureEnabled: false, animation: 'none', contentStyle: { backgroundColor: colors.background } }}
      />

      {/* Modal & Stack Sub-pages with Native iOS Swipe-Back Gesture */}
      <Stack.Screen
        name="ask"
        options={{ animation: 'slide_from_bottom', gestureEnabled: true, contentStyle: { backgroundColor: colors.background } }}
      />
      <Stack.Screen
        name="post/[id]"
        options={{ animation: defaultAnimation, gestureEnabled: true, contentStyle: { backgroundColor: colors.background } }}
      />
      <Stack.Screen
        name="messages/[id]"
        options={{ animation: defaultAnimation, gestureEnabled: true, contentStyle: { backgroundColor: colors.background } }}
      />
      <Stack.Screen
        name="profile/settings"
        options={{ animation: defaultAnimation, gestureEnabled: true, contentStyle: { backgroundColor: colors.background } }}
      />
      <Stack.Screen
        name="notifications"
        options={{ animation: defaultAnimation, gestureEnabled: true, contentStyle: { backgroundColor: colors.background } }}
      />
      <Stack.Screen
        name="explore/university/[id]"
        options={{ animation: defaultAnimation, gestureEnabled: true, contentStyle: { backgroundColor: colors.background } }}
      />
    </Stack>
  );
}
