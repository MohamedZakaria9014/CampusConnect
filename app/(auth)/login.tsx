import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, GraduationCap, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { loginSchema, LoginFormData } from '../../src/utils/validators';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { supabase } from '../../src/lib/supabase';
import { SPACING, RADIUS } from '../../src/constants/theme';

export default function LoginScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  const { setSession, loadUserProfile } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (authData.session) {
        setSession(authData.session);
        await loadUserProfile(authData.user.id);
        router.replace('/(main)');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setSession({ user: { id: 'a0000000-0000-0000-0000-000000000001' } });
    await loadUserProfile('a0000000-0000-0000-0000-000000000001');
    router.replace('/(main)');
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Branding Header */}
        <View style={styles.brandContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
            <GraduationCap size={40} color="#FFFFFF" />
          </View>
          <Text style={[styles.brandTitle, { color: colors.text }]}>Campus Connect</Text>
          <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
            The Academic Social Community for University Students
          </Text>
        </View>

        {/* Login Form Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.formTitle, { color: colors.text }]}>Welcome Back</Text>

          {errorMessage && (
            <View style={[styles.errorBanner, { backgroundColor: colors.error + '15' }]}>
              <Text style={[styles.errorBannerText, { color: colors.error }]}>{errorMessage}</Text>
            </View>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="john.doe@university.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
                iconPrefix={<Mail size={18} color={colors.icon} />}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
                iconPrefix={<Lock size={18} color={colors.icon} />}
                iconSuffix={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                    {showPassword ? (
                      <EyeOff size={18} color={colors.icon} />
                    ) : (
                      <Eye size={18} color={colors.icon} />
                    )}
                  </TouchableOpacity>
                }
              />
            )}
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            loading={loading}
            onPress={handleSubmit(onSubmit)}
            icon={<ArrowRight size={18} color="#FFFFFF" />}
            style={styles.submitBtn}
          />

          <View style={styles.dividerRow}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR DEMO MODE</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          <Button
            title="Instant Demo Student Login"
            variant="secondary"
            onPress={handleQuickDemoLogin}
          />
        </View>

        {/* Footer Link */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
  errorBanner: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  errorBannerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: SPACING.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    marginHorizontal: SPACING.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
