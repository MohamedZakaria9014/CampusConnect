import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  RotateCw,
  KeyRound,
} from 'lucide-react-native';
import { useThemeStore } from '../../src/store/useThemeStore';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { supabase } from '../../src/lib/supabase';
import { SPACING, RADIUS } from '../../src/constants/theme';

export default function ForgotPasswordScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();

  const [step, setStep] = useState<'email' | 'verify_otp'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const getRedirectUrl = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return `${window.location.origin}/reset-password`;
    }
    return Linking.createURL('/reset-password');
  };

  const handleSendReset = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Email Required', 'Please enter your university email address.');
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = getRedirectUrl();
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        Alert.alert('Notice', error.message);
      } else {
        setStep('verify_otp');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send recovery code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setResending(true);
    try {
      const redirectUrl = getRedirectUrl();
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        Alert.alert('Notice', error.message);
      } else {
        Alert.alert('Email Sent', 'A fresh recovery email has been sent to your inbox.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to resend recovery code.');
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async () => {
    const trimmedCode = otpCode.trim();
    const trimmedEmail = email.trim();

    if (!trimmedCode) {
      Alert.alert('Code Required', 'Please enter the 6-digit recovery code from your email.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords Do Not Match', 'Please ensure both password fields match.');
      return;
    }

    setVerifying(true);
    try {
      // 1. Verify the OTP code with Supabase Auth
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token: trimmedCode,
        type: 'recovery',
      });

      if (otpError) {
        throw otpError;
      }

      // 2. Set new password for the verified user session
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      Alert.alert(
        'Password Reset Successful!',
        'Your password has been changed. You can now sign in with your new password.',
        [
          {
            text: 'Sign In',
            onPress: async () => {
              await supabase.auth.signOut();
              router.replace('/(auth)/login');
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        'Verification Failed',
        err.message || 'Invalid or expired code. Please verify the code or request a new one.'
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          onPress={() => {
            if (step === 'verify_otp') {
              setStep('email');
            } else if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(auth)/login');
            }
          }}
          style={styles.backBtn}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {step === 'email'
            ? 'Enter your registered email address and we will send you a password reset link.'
            : `We sent a recovery email to ${email}. Tap the "Reset password" link in your email, or enter your code below.`}
        </Text>

        {step === 'email' ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Input
              label="University Email"
              placeholder="john.doe@university.edu"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              iconPrefix={<Mail size={18} color={colors.icon} />}
            />
            <Button
              title="Send Reset Link"
              loading={loading}
              onPress={handleSendReset}
              style={{ marginTop: SPACING.sm }}
            />
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.infoBanner, { backgroundColor: colors.primaryLight + '15', borderColor: colors.primary }]}>
              <CheckCircle2 size={20} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>Email Sent Successfully</Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  We sent an email to <Text style={{ fontWeight: '700', color: colors.text }}>{email}</Text>.
                  {'\n\n'}
                  👉 <Text style={{ fontWeight: '700', color: colors.primary }}>Recommended:</Text> Open your email on this device and tap the <Text style={{ fontWeight: '700', color: colors.text }}>"Reset password"</Text> button to set a new password instantly.
                  {'\n\n'}
                  🔢 If you received a 6-digit recovery code instead, enter it below:
                </Text>
              </View>
            </View>

            <Input
              label="6-Digit Recovery Code (Optional)"
              placeholder="e.g. 123456"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={10}
              iconPrefix={<KeyRound size={18} color={colors.icon} />}
            />

            <Input
              label="New Password"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              iconPrefix={<Lock size={18} color={colors.icon} />}
              iconSuffix={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {showPassword ? <EyeOff size={18} color={colors.icon} /> : <Eye size={18} color={colors.icon} />}
                </TouchableOpacity>
              }
            />

            <Input
              label="Confirm New Password"
              placeholder="Re-type new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              iconPrefix={<Lock size={18} color={colors.icon} />}
            />

            <Button
              title="Update Password with Code"
              loading={verifying}
              onPress={handleResetPassword}
              style={{ marginTop: SPACING.sm }}
            />

            <View style={styles.secondaryActions}>
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={resending}
                style={styles.resendBtn}
              >
                <RotateCw size={14} color={colors.primary} />
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  {resending ? 'Sending...' : 'Resend Email'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStep('email')}
                style={styles.resendBtn}
              >
                <Text style={[styles.changeEmailText, { color: colors.textMuted }]}>
                  Change Email
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          style={styles.returnToLoginBtn}
        >
          <Text style={[styles.returnToLoginText, { color: colors.textSecondary }]}>
            Remember your password? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
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
    paddingBottom: SPACING.xxl,
  },
  backBtn: {
    marginBottom: SPACING.lg,
    alignSelf: 'flex-start',
    padding: 4,
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '700',
  },
  changeEmailText: {
    fontSize: 13,
    fontWeight: '500',
  },
  returnToLoginBtn: {
    marginTop: SPACING.xxl,
    alignItems: 'center',
  },
  returnToLoginText: {
    fontSize: 14,
  },
});
