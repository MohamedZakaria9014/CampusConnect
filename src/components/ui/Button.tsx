import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { SPACING, RADIUS } from '../../constants/theme';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  style,
  textStyle,
  ...rest
}) => {
  const { colors } = useThemeStore();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border },
          text: { color: colors.text },
        };
      case 'outline':
        return {
          container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
          text: { color: colors.primary },
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: colors.primary },
        };
      case 'danger':
        return {
          container: { backgroundColor: colors.error },
          text: { color: '#FFFFFF' },
        };
      case 'primary':
      default:
        return {
          container: { backgroundColor: colors.primary },
          text: { color: '#FFFFFF' },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md },
          text: { fontSize: 13, fontWeight: '600' },
        };
      case 'lg':
        return {
          container: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.lg },
          text: { fontSize: 17, fontWeight: '700' },
        };
      case 'md':
      default:
        return {
          container: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md },
          text: { fontSize: 15, fontWeight: '600' },
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.button,
        vStyles.container,
        sStyles.container,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={vStyles.text.color} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, vStyles.text, sStyles.text, icon ? { marginLeft: 8 } : null, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
