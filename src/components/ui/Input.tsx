import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { SPACING, RADIUS } from '../../constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  iconPrefix?: React.ReactNode;
  iconSuffix?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  iconPrefix,
  iconSuffix,
  containerStyle,
  style,
  placeholderTextColor,
  ...rest
}) => {
  const { colors } = useThemeStore();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.inputBg,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
      >
        {iconPrefix && <View style={styles.prefix}>{iconPrefix}</View>}
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            style,
          ]}
          placeholderTextColor={placeholderTextColor || colors.textSecondary}
          {...rest}
        />
        {iconSuffix && <View style={styles.suffix}>{iconSuffix}</View>}
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
  },
  prefix: {
    marginRight: SPACING.sm,
  },
  suffix: {
    marginLeft: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: SPACING.sm,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
