import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Sun, Bell, Shield, LogOut } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { supabase } from '../../../src/lib/supabase';
import { SPACING, RADIUS } from '../../../src/constants/theme';

export default function SettingsScreen() {
  const { mode, toggleTheme, colors } = useThemeStore();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topHeader, { borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings & Preferences</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Appearance Settings */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeaderTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingMeta}>
              {mode === 'dark' ? <Moon size={20} color={colors.primary} /> : <Sun size={20} color={colors.warning} />}
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch value={mode === 'dark'} onValueChange={toggleTheme} trackColor={{ true: colors.primary }} />
          </View>
        </View>

        {/* Notifications Settings */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeaderTitle, { color: colors.textSecondary }]}>NOTIFICATIONS</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingMeta}>
              <Bell size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Push Notifications</Text>
            </View>
            <Switch value={true} onValueChange={() => {}} trackColor={{ true: colors.primary }} />
          </View>
        </View>

        {/* Security & RLS Policies info */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeaderTitle, { color: colors.textSecondary }]}>SECURITY & PRIVACY</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingMeta}>
              <Shield size={20} color={colors.accent} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Protected RLS Authorization</Text>
            </View>
            <Text style={[styles.statusTag, { color: colors.accent }]}>Active</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: colors.error + '15' }]}>
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Log Out of Campus Connect</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  iconBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  sectionCard: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusTag: {
    fontSize: 13,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
