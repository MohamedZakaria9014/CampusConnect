import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export interface CardProps extends ViewProps {
  style?: ViewStyle;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ style, children, ...rest }) => {
  const { colors, mode } = useThemeStore();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: mode === 'dark' ? colors.card : colors.surface,
          borderColor: colors.border,
        },
        SHADOWS.small,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    marginVertical: SPACING.xs,
  },
});
