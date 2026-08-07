import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, UserPlus, UserCheck, MessageCircle, Award } from 'lucide-react-native';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { fetchUserProfile } from '../../src/services/api.auth';
import { fetchPosts } from '../../src/services/api.posts';
import { Avatar } from '../../src/components/ui/Avatar';
import { TopStudentBadge } from '../../src/components/ui/TopStudentBadge';
import { PostCard } from '../../src/components/features/PostCard';
import { Button } from '../../src/components/ui/Button';
import { PREDEFINED_BADGES } from '../../src/constants/badges';
import { formatGPA } from '../../src/utils/formatters';
import { SPACING, RADIUS } from '../../src/constants/theme';

export default function OtherUserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeStore();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  const [isFollowing, setIsFollowing] = useState(false);

  const { data: student, isLoading } = useQuery({
    queryKey: ['studentProfile', id],
    queryFn: () => fetchUserProfile(id as string),
  });

  const { data: posts } = useQuery({
    queryKey: ['studentPosts', id],
    queryFn: () => fetchPosts({ userId: id }),
  });

  const handleToggleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  const handleStartMessage = () => {
    router.push(`/(main)/messages/${id}` as any);
  };

  if (isLoading || !student) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topHeader, { borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{student.full_name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Header */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.profileRow}>
            <Avatar url={student.avatar_url} name={student.full_name} size={72} showBorder />
            <View style={styles.profileMeta}>
              <View style={styles.nameRow}>
                <Text style={[styles.fullName, { color: colors.text }]}>{student.full_name}</Text>
                {student.is_top_student && <TopStudentBadge size="md" />}
              </View>
              <Text style={[styles.usernameText, { color: colors.textSecondary }]}>@{student.username}</Text>

              <Text style={[styles.academicPill, { color: colors.primary, backgroundColor: colors.primaryLight + '20' }]}>
                {student.university?.short_name || 'CU'} • {student.major || 'Computer Science'} • {student.year}
              </Text>
            </View>
          </View>

          {student.bio ? <Text style={[styles.bioText, { color: colors.textSecondary }]}>{student.bio}</Text> : null}

          {/* Action Buttons: Follow + Message */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={handleToggleFollow}
              style={[
                styles.followBtn,
                { backgroundColor: isFollowing ? colors.surfaceSecondary : colors.primary },
              ]}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={16} color={colors.text} />
                  <Text style={[styles.actionBtnText, { color: colors.text }]}>Following</Text>
                </>
              ) : (
                <>
                  <UserPlus size={16} color="#FFFFFF" />
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Follow Student</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleStartMessage}
              style={[styles.messageBtn, { backgroundColor: colors.secondary }]}
            >
              <MessageCircle size={16} color="#FFFFFF" />
              <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Direct Message</Text>
            </TouchableOpacity>
          </View>

          {/* Academic Stats Grid */}
          <View style={[styles.statsGrid, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{formatGPA(student.gpa)}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>GPA</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{student.reputation || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Reputation</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>{student.best_answers_count || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Best Answers</Text>
            </View>
          </View>
        </View>

        {/* Earned Badges */}
        <View style={styles.sectionMargin}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Badges & Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
            {PREDEFINED_BADGES.slice(0, 3).map((badge) => (
              <View
                key={badge.slug}
                style={[styles.badgeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.badgeIconCircle, { backgroundColor: badge.color + '20' }]}>
                  <Award size={22} color={badge.color} />
                </View>
                <Text style={[styles.badgeName, { color: colors.text }]}>{badge.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Questions Asked by Student */}
        <View style={styles.sectionMargin}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Questions ({posts?.length || 0})</Text>
          {posts?.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPress={() => router.push(`/(main)/post/${post.id}` as any)}
            />
          ))}
        </View>
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
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: SPACING.md,
  },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
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
    width: 110,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  badgeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
