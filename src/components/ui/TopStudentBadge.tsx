import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Award, Sparkles } from 'lucide-react-native';
import { useThemeStore } from '../../store/useThemeStore';

export interface TopStudentBadgeProps {
  size?: 'sm' | 'md';
  showText?: boolean;
}

export const TopStudentBadge: React.FC<TopStudentBadgeProps> = ({ size = 'sm', showText = true }) => {
  const { colors } = useThemeStore();
  const iconSize = size === 'sm' ? 12 : 15;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.badgeTopStudentBg,
          borderColor: colors.badgeTopStudentText + '40',
          paddingHorizontal: size === 'sm' ? 8 : 10,
          paddingVertical: size === 'sm' ? 3 : 5,
        },
      ]}
    >
      <Award size={iconSize} color={colors.badgeTopStudentText} />
      {showText && (
        <Text
          style={[
            styles.text,
            {
              color: colors.badgeTopStudentText,
              fontSize: size === 'sm' ? 11 : 13,
            },
          ]}
        >
          Top Student
        </Text>
      )}
      <Sparkles size={10} color={colors.badgeTopStudentText} style={{ marginLeft: 2 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.2,
  },
});
