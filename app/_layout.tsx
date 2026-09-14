import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments, DarkTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeStore } from '../src/store/useThemeStore';
import { useAuthStore } from '../src/store/useAuthStore';
import { supabase } from '../src/lib/supabase';
import { registerForPushNotificationsAsync } from '../src/lib/notifications';
import { useRealtimeNotifications } from '../src/hooks/useRealtimeNotifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2, // 2 minutes fresh state
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
      refetchOnReconnect: true,
    },
  },
});

function RootAppContent({ navigationTheme, colors }: { navigationTheme: any; colors: any }) {
  useRealtimeNotifications();

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          contentStyle: { backgroundColor: colors.background },
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
        }}
      >
        <Stack.Screen name="(main)" options={{ gestureEnabled: false, contentStyle: { backgroundColor: colors.background } }} />
        <Stack.Screen name="(auth)" options={{ contentStyle: { backgroundColor: colors.background } }} />
        <Stack.Screen name="(onboarding)" options={{ contentStyle: { backgroundColor: colors.background } }} />
        <Stack.Screen name="user/[id]" options={{ headerShown: false, gestureEnabled: true, contentStyle: { backgroundColor: colors.background } }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colors = useThemeStore((s) => s.colors);
  const session = useAuthStore((s) => s.session);
  const setSession = useAuthStore((s) => s.setSession);
  const loadUserProfile = useAuthStore((s) => s.loadUserProfile);
  const router = useRouter();
  const segments = useSegments();

  const navigationTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  // Keep native window background color synchronized with theme to prevent white flash on swipe-back
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      if (activeSession) {
        setSession(activeSession);
        loadUserProfile(activeSession.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, activeSession) => {
      setSession(activeSession);
      if (activeSession?.user?.id) {
        loadUserProfile(activeSession.user.id);
      }
    });

    registerForPushNotificationsAsync().catch(() => {});

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setSession, loadUserProfile]);

  // Automatic session recovery: redirect to main app if signed in (except when resetting password)
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const isResettingPassword =
      segments[1] === 'reset-password' || segments[1] === 'forgot-password';
    if (session && inAuthGroup && !isResettingPassword) {
      router.replace('/(main)/(tabs)');
    }
  }, [session, segments, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <RootAppContent navigationTheme={navigationTheme} colors={colors} />
    </QueryClientProvider>
  );
}
