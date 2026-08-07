import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Copy, Check } from 'lucide-react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { SPACING, RADIUS } from '../../constants/theme';

export interface CodeBlockProps {
  code?: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'code' }) => {
  const { colors } = useThemeStore();
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.codeBg }]}>
      <View style={[styles.header, { borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
        <Text style={styles.langText}>{language.toUpperCase()}</Text>
        <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
          {copied ? (
            <Check size={14} color="#34D399" />
          ) : (
            <Copy size={14} color="#9CA3AF" />
          )}
          <Text style={[styles.copyText, copied && { color: '#34D399' }]}>
            {copied ? 'Copied!' : 'Copy'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.codeBody}>
        <Text style={[styles.codeText, { color: colors.codeText }]} numberOfLines={20}>
          {code}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.md,
    marginVertical: SPACING.xs,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
  },
  langText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '600',
  },
  codeBody: {
    padding: SPACING.md,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 13,
    lineHeight: 18,
  },
});
