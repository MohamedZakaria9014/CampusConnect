import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Compass, PlusCircle, MessageSquare, User } from 'lucide-react-native';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useChatStore } from '../../src/store/useChatStore';

export default function MainLayout() {
  const { colors } = useThemeStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const unreadCount = useChatStore((s) => s.unreadCount);

  const bottomInset = Math.max(insets.bottom, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0.5,
          borderTopColor: colors.border + '60',
          height: 52 + (bottomInset > 0 ? bottomInset - 4 : 8),
          paddingBottom: bottomInset > 0 ? bottomInset - 6 : 6,
          paddingTop: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Compass size={size - 2} color={color} />,
        }}
      />

      {/* Perfectly Centered Ask Button */}
      <Tabs.Screen
        name="ask"
        options={{
          title: 'Ask',
          tabBarButton: (props) => {
            const { delayLongPress, ...restProps } = props as any;
            return (
              <TouchableOpacity
                {...restProps}
                activeOpacity={0.85}
                onPress={() => router.push('/(main)/ask')}
                style={[props.style, styles.askTabBtn]}
              >
                <View style={[styles.askIconCircle, { backgroundColor: colors.primary }]}>
                  <PlusCircle size={26} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            );
          },
        }}
      />

      <Tabs.Screen
        name="messages/index"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <MessageSquare size={size - 2} color={color} />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size - 2} color={color} />,
        }}
      />

      {/* Sub-routes hidden from bottom tab bar */}
      <Tabs.Screen name="post/[id]" options={{ href: null }} />
      <Tabs.Screen name="messages/[id]" options={{ href: null }} />
      <Tabs.Screen name="profile/settings" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  askTabBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    top: -12,
  },
  askIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
