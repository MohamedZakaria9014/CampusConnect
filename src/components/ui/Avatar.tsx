import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';

export interface AvatarProps {
  url?: string;
  name?: string;
  size?: number;
  isOnline?: boolean;
  showBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  url,
  name = 'User',
  size = 40,
  isOnline = false,
  showBorder = false,
}) => {
  const { colors } = useThemeStore();

  const getInitials = (str: string) => {
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const borderRadius = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {url ? (
        <Image
          source={{ uri: url }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius,
              borderColor: showBorder ? colors.primary : 'transparent',
              borderWidth: showBorder ? 2 : 0,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius,
              backgroundColor: colors.primaryLight,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.4, color: '#FFFFFF' }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}

      {isOnline && (
        <View
          style={[
            styles.onlineIndicator,
            {
              backgroundColor: colors.accent,
              borderColor: colors.background,
              width: Math.max(10, size * 0.28),
              height: Math.max(10, size * 0.28),
              borderRadius: size * 0.14,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
});
