import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { useThemeStore } from '../../src/store/useThemeStore';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { supabase } from '../../src/lib/supabase';
import { SPACING, RADIUS } from '../../src/constants/theme';

export default function ForgotPasswordScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendReset = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email);
      setSent(true);
    } catch (e) {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your university email address and we will send you a password reset link.
        </Text>

        {sent ? (
          <View style={[styles.successCard, { backgroundColor: colors.accent + '15' }]}>
            <CheckCircle size={32} color={colors.accent} />
            <Text style={[styles.successTitle, { color: colors.accent }]}>Email Sent!</Text>
            <Text style={[styles.successBody, { color: colors.textSecondary }]}>
              Please check your inbox for instructions to reset your password.
            </Text>
            <Button
              title="Return to Sign In"
              onPress={() => router.replace('/(auth)/login')}
              style={{ marginTop: SPACING.md }}
            />
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Input
              label="Email"
              placeholder="john.doe@university.edu"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              iconPrefix={<Mail size={18} color={colors.icon} />}
            />
            <Button
              title="Send Recovery Link"
              loading={loading}
              onPress={handleSendReset}
              style={{ marginTop: SPACING.sm }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxl + 20,
  },
  backBtn: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  card: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  successCard: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  successBody: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },
});
