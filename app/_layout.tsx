import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeStore } from '../src/store/useThemeStore';
import { useAuthStore } from '../src/store/useAuthStore';
import { supabase } from '../src/lib/supabase';
import { registerForPushNotificationsAsync } from '../src/lib/notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  const { mode, colors } = useThemeStore();
  const { session, setSession, loadUserProfile } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

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

    registerForPushNotificationsAsync();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Automatic session recovery: redirect to main app if signed in
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (session && inAuthGroup) {
      router.replace('/(main)');
    }
  }, [session, segments]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(main)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="user/[id]" options={{ headerShown: false, gestureEnabled: true }} />
      </Stack>
    </QueryClientProvider>
  );
}
