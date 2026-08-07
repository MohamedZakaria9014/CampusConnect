import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, Award, BookOpen, MessageSquare, Bookmark, CheckCircle2, Star, Edit3 } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { fetchPosts } from '../../../src/services/api.posts';
import { Avatar } from '../../../src/components/ui/Avatar';
import { TopStudentBadge } from '../../../src/components/ui/TopStudentBadge';
import { PostCard } from '../../../src/components/features/PostCard';
import { PREDEFINED_BADGES } from '../../../src/constants/badges';
import { formatGPA, formatCount } from '../../../src/utils/formatters';
import { SPACING, RADIUS } from '../../../src/constants/theme';
import { evaluateTopStudentStatus } from '../../../src/lib/topStudent';

export default function ProfileScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<'posts' | 'answers' | 'saved'>('posts');

  const { data: userPosts } = useQuery({
    queryKey: ['userPosts', user?.id],
    queryFn: () => fetchPosts({ userId: user?.id }),
  });

  const topStudentEval = evaluateTopStudentStatus(user || {});

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={[styles.topHeader, { borderColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Academic Profile</Text>
        <TouchableOpacity onPress={() => router.push('/(main)/profile/settings')} style={styles.iconBtn}>
          <Settings size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.profileRow}>
            <Avatar url={user?.avatar_url} name={user?.full_name || 'Student'} size={72} showBorder />
            <View style={styles.profileMeta}>
              <View style={styles.nameRow}>
                <Text style={[styles.fullName, { color: colors.text }]}>{user?.full_name || 'Omar Hassan'}</Text>
                {user?.is_top_student && <TopStudentBadge size="md" />}
              </View>
              <Text style={[styles.usernameText, { color: colors.textSecondary }]}>@{user?.username || 'omar_cs'}</Text>

              <Text style={[styles.academicPill, { color: colors.primary, backgroundColor: colors.primaryLight + '20' }]}>
                {user?.university?.short_name || 'CU'} • {user?.major || 'Computer Science'} • {user?.year || 'Senior'}
              </Text>
            </View>
          </View>

          {user?.bio ? <Text style={[styles.bioText, { color: colors.textSecondary }]}>{user.bio}</Text> : null}

          {/* Academic Stats Grid */}
          <View style={[styles.statsGrid, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{formatGPA(user?.gpa)}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>GPA</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{user?.reputation || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Reputation</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{user?.helpful_answers_count || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Helpful Solutions</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>{user?.best_answers_count || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Best Answers</Text>
            </View>
          </View>

          {/* Edit Profile Action Button */}
          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/complete-profile')}
            style={[styles.editBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
          >
            <Edit3 size={16} color={colors.text} />
            <Text style={[styles.editBtnText, { color: colors.text }]}>Edit Academic Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Top Student Qualification Progress if not yet qualified */}
        {!user?.is_top_student && (
          <View style={[styles.qualCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Award size={18} color={colors.primary} />
              <Text style={[styles.qualTitle, { color: colors.text }]}>Top Student Qualification Progress</Text>
            </View>
            <Text style={[styles.qualSub, { color: colors.textSecondary }]}>
              Reach 3.6+ GPA or 100+ Reputation to earn the Top Student Badge!
            </Text>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${topStudentEval.progressToNext.repProgress}%`, backgroundColor: colors.primary }]} />
            </View>
          </View>
        )}

        {/* Earned Badges Showcase */}
        <View style={styles.sectionMargin}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Earned Badges</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
            {PREDEFINED_BADGES.map((badge) => (
              <View
                key={badge.slug}
                style={[
                  styles.badgeCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={[styles.badgeIconCircle, { backgroundColor: badge.color + '20' }]}>
                  <Award size={24} color={badge.color} />
                </View>
                <Text style={[styles.badgeName, { color: colors.text }]}>{badge.name}</Text>
                <Text style={[styles.badgeDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {badge.description}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Tabbed Content: My Questions / Answers / Saved */}
        <View style={styles.tabHeader}>
          {[
            { id: 'posts', label: `Questions (${user?.questions_count || 0})` },
            { id: 'answers', label: `Answers (${user?.answers_count || 0})` },
            { id: 'saved', label: 'Saved Posts' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                style={[
                  styles.tabPill,
                  { backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary },
                ]}
              >
                <Text style={[styles.tabPillText, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {userPosts?.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPress={() => router.push(`/(main)/post/${post.id}` as any)}
          />
        ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  iconBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  profileCard: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileMeta: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  fullName: {
    fontSize: 18,
    fontWeight: '800',
  },
  usernameText: {
    fontSize: 13,
    marginTop: 2,
  },
  academicPill: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  editBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: SPACING.md,
    gap: 6,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  qualCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  qualTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  qualSub: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionMargin: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  badgeScroll: {
    flexDirection: 'row',
  },
  badgeCard: {
    width: 140,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  badgeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  tabHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
