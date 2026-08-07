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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, AtSign, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { signupSchema, SignupFormData } from '../../src/utils/validators';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { supabase } from '../../src/lib/supabase';
import { SPACING, RADIUS } from '../../src/constants/theme';

export default function SignupScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  const { setSession, setUser } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      username: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            username: data.username,
          },
        },
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          setErrorMessage('Email rate limit reached for test emails. (Tip: Disable "Confirm email" in Supabase Auth settings for unlimited instant signups during dev).');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (authData.session) {
        setSession(authData.session);
      }

      router.push({
        pathname: '/(onboarding)/complete-profile',
        params: { fullName: data.fullName, username: data.username },
      } as any);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/login')}
              style={styles.backBtn}
            >
              <ArrowLeft size={22} color={colors.text} />
            </TouchableOpacity>

            <Text style={[styles.title, { color: colors.text }]}>Create Student Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join thousands of peers asking & solving university challenges together.
            </Text>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {errorMessage && (
              <View style={[styles.errorBanner, { backgroundColor: colors.error + '15' }]}>
                <Text style={[styles.errorBannerText, { color: colors.error }]}>{errorMessage}</Text>
              </View>
            )}

            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.fullName?.message}
                  iconPrefix={<User size={18} color={colors.icon} />}
                />
              )}
            />

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Username"
                  placeholder="john_doe"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.username?.message}
                  iconPrefix={<AtSign size={18} color={colors.icon} />}
                />
              )}
            />

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

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="••••••••"
                  secureTextEntry={!showConfirmPassword}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                  iconPrefix={<Lock size={18} color={colors.icon} />}
                  iconSuffix={
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 4 }}>
                      {showConfirmPassword ? (
                        <EyeOff size={18} color={colors.icon} />
                      ) : (
                        <Eye size={18} color={colors.icon} />
                      )}
                    </TouchableOpacity>
                  }
                />
              )}
            />

            <Button
              title="Continue to Academic Profile"
              loading={loading}
              onPress={handleSubmit(onSubmit)}
              icon={<ArrowRight size={18} color="#FFFFFF" />}
              style={styles.submitBtn}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl + 8,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  backBtn: {
    marginBottom: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  card: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
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
  submitBtn: {
    marginTop: SPACING.md,
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
