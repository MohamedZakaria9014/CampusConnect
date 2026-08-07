import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';

export default function Index() {
  const { session, isOnboarded } = useAuthStore();

  if (session) {
    if (!isOnboarded) {
      return <Redirect href="/(onboarding)/complete-profile" />;
    }
    return <Redirect href="/(main)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
