import { Stack } from 'expo-router';
import { useThemeStore } from '../../src/store/useThemeStore';

export default function AuthLayout() {
  const { colors } = useThemeStore();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
