import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react-native";
import { useThemeStore } from "../../src/store/useThemeStore";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/ui/Button";
import { supabase } from "../../src/lib/supabase";
import { SPACING, RADIUS } from "../../src/constants/theme";

function parseUrlParams(url: string) {
  const result: Record<string, string> = {};
  if (!url) return result;

  // 1. Parse Hash Fragment (#access_token=...&...)
  const hashIdx = url.indexOf("#");
  if (hashIdx !== -1) {
    const hashStr = url.substring(hashIdx + 1);
    const pairs = hashStr.split("&");
    for (const pair of pairs) {
      const [k, v] = pair.split("=");
      if (k && v) {
        result[decodeURIComponent(k)] = decodeURIComponent(
          v.replace(/\+/g, " "),
        );
      }
    }
  }

  // 2. Parse Query String (?code=...&...)
  const queryIdx = url.indexOf("?");
  if (queryIdx !== -1) {
    const endIdx = hashIdx !== -1 && hashIdx > queryIdx ? hashIdx : url.length;
    const queryStr = url.substring(queryIdx + 1, endIdx);
    const pairs = queryStr.split("&");
    for (const pair of pairs) {
      const [k, v] = pair.split("=");
      if (k && v) {
        result[decodeURIComponent(k)] = decodeURIComponent(
          v.replace(/\+/g, " "),
        );
      }
    }
  }

  return result;
}

export default function ResetPasswordScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  const incomingUrl = Linking.useURL();

  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function handleIncomingUrl(url: string | null) {
      setLoading(true);
      setErrorMessage(null);

      try {
        // 1. Check if user already has an active session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          if (isMounted) {
            setSessionReady(true);
            setLoading(false);
          }
          return;
        }

        if (!url) {
          const initial = await Linking.getInitialURL();
          if (initial) {
            url = initial;
          }
        }

        if (url) {
          const params = parseUrlParams(url);

          // Check for errors returned by Supabase (e.g. otp_expired)
          if (params.error || params.error_code) {
            const desc =
              params.error_description ||
              params.error ||
              "The password reset link has expired or was already used.";
            if (isMounted) {
              setErrorMessage(desc);
              setLoading(false);
            }
            return;
          }

          // Check for access_token and refresh_token
          if (params.access_token && params.refresh_token) {
            const { error: setSessionErr } = await supabase.auth.setSession({
              access_token: params.access_token,
              refresh_token: params.refresh_token,
            });
            if (setSessionErr) {
              throw setSessionErr;
            }
            if (isMounted) {
              setSessionReady(true);
              setLoading(false);
            }
            return;
          }
          // Check for PKCE code
          if (params.code) {
            const { error: exchangeErr } =
              await supabase.auth.exchangeCodeForSession(params.code);
            if (exchangeErr) {
              throw exchangeErr;
            }
            if (isMounted) {
              setSessionReady(true);
              setLoading(false);
            }
            return;
          }
        }

        // If no token or params found yet, check session again
        const { data: finalCheck } = await supabase.auth.getSession();
        if (finalCheck?.session) {
          if (isMounted) {
            setSessionReady(true);
            setLoading(false);
          }
        } else {
          if (isMounted) {
            setLoading(false);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || "Unable to verify recovery link.");
          setLoading(false);
        }
      }
    }

    handleIncomingUrl(incomingUrl);

    return () => {
      isMounted = false;
    };
  }, [incomingUrl]);

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert(
        "Password Too Short",
        "Password must be at least 6 characters.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Passwords Do Not Match",
        "Please ensure both password fields match.",
      );
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        "Password Updated Successfully!",
        "Your password has been changed. You can now sign in with your new credentials.",
        [
          {
            text: "Sign In",
            onPress: async () => {
              await supabase.auth.signOut();
              router.replace("/(auth)/login");
            },
          },
        ],
      );
    } catch (err: any) {
      Alert.alert(
        "Update Failed",
        err.message || "Failed to update password. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          style={styles.backBtn}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>New Password</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Create a secure, new password for your account.
        </Text>

        {loading ? (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                alignItems: "center",
                paddingVertical: 40,
              },
            ]}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={{
                marginTop: 12,
                color: colors.textSecondary,
                fontSize: 14,
              }}
            >
              Verifying recovery authorization...
            </Text>
          </View>
        ) : errorMessage ? (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: colors.error + "15",
                  borderColor: colors.error,
                },
              ]}
            >
              <AlertTriangle size={24} color={colors.error} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.errorTitle, { color: colors.error }]}>
                  Link Expired or Invalid
                </Text>
                <Text
                  style={[styles.errorText, { color: colors.textSecondary }]}
                >
                  {errorMessage}
                </Text>
              </View>
            </View>

            <Text style={[styles.hintText, { color: colors.textMuted }]}>
              Recovery links are single-use and expire quickly. You can enter
              the 6-digit recovery code from your email directly, or request a
              new link.
            </Text>

            <Button
              title="Enter 6-Digit Code / Request New"
              onPress={() => router.replace("/(auth)/forgot-password")}
              style={{ marginTop: SPACING.md }}
            />
          </View>
        ) : sessionReady ? (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.successBanner,
                {
                  backgroundColor: colors.primaryLight + "15",
                  borderColor: colors.primary,
                },
              ]}
            >
              <CheckCircle2 size={20} color={colors.primary} />
              <Text style={[styles.successText, { color: colors.text }]}>
                Identity verified! Please set your new password.
              </Text>
            </View>

            <Input
              label="New Password"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              iconPrefix={<Lock size={18} color={colors.icon} />}
              iconSuffix={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.icon} />
                  ) : (
                    <Eye size={18} color={colors.icon} />
                  )}
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
              title="Save New Password"
              loading={saving}
              onPress={handleUpdatePassword}
              style={{ marginTop: SPACING.sm }}
            />
          </View>
        ) : (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.errorText,
                {
                  color: colors.textSecondary,
                  textAlign: "center",
                  marginBottom: SPACING.md,
                },
              ]}
            >
              No active recovery session found. Please enter your email to
              receive a recovery code.
            </Text>
            <Button
              title="Go to Password Reset"
              onPress={() => router.replace("/(auth)/forgot-password")}
            />
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          style={styles.returnToLoginBtn}
        >
          <Text
            style={[styles.returnToLoginText, { color: colors.textSecondary }]}
          >
            Return to{" "}
            <Text style={{ color: colors.primary, fontWeight: "700" }}>
              Sign In
            </Text>
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
    alignSelf: "flex-start",
    padding: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
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
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    gap: 8,
  },
  successText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  hintText: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  returnToLoginBtn: {
    marginTop: SPACING.xxl,
    alignItems: "center",
  },
  returnToLoginText: {
    fontSize: 14,
  },
});
