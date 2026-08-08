import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Award,
  Bookmark,
  Edit3,
  HelpCircle,
  MessageSquare,
  PlusCircle,
  Settings,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnswerCard } from "../../../src/components/features/AnswerCard";
import { PostCard } from "../../../src/components/features/PostCard";
import { Avatar } from "../../../src/components/ui/Avatar";
import { TopStudentBadge } from "../../../src/components/ui/TopStudentBadge";
import { PREDEFINED_BADGES } from "../../../src/constants/badges";
import { RADIUS, SPACING } from "../../../src/constants/theme";
import { evaluateTopStudentStatus } from "../../../src/lib/topStudent";
import { fetchAnswersForUser } from "../../../src/services/api.answers";
import { fetchPosts, fetchSavedPosts } from "../../../src/services/api.posts";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { useThemeStore } from "../../../src/store/useThemeStore";
import { formatGPA } from "../../../src/utils/formatters";

export default function ProfileScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<"posts" | "answers" | "saved">(
    "posts",
  );

  const userId = user?.id || "";

  // Fetch Questions created by current user
  const {
    data: userPosts,
    refetch: refetchPosts,
    isLoading: isPostsLoading,
  } = useQuery({
    queryKey: ["userPosts", userId],
    queryFn: () => fetchPosts({ userId }),
    enabled: !!userId,
  });

  // Fetch Answers/Comments created by current user
  const {
    data: userAnswers,
    refetch: refetchAnswers,
    isLoading: isAnswersLoading,
  } = useQuery({
    queryKey: ["userAnswers", userId],
    queryFn: () => fetchAnswersForUser(userId),
    enabled: !!userId,
  });

  // Fetch Saved Posts bookmarked by current user
  const {
    data: savedPosts,
    refetch: refetchSaved,
    isLoading: isSavedLoading,
  } = useQuery({
    queryKey: ["savedPosts", userId],
    queryFn: () => fetchSavedPosts(userId),
    enabled: !!userId,
  });

  // Refetch active tab query when profile screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      refetchPosts();
      refetchAnswers();
      refetchSaved();
    }, [userId]),
  );

  const topStudentEval = evaluateTopStudentStatus(user || {});

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {/* Top Header */}
      <View style={[styles.topHeader, { borderColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Academic Profile
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(main)/profile/settings")}
          style={styles.iconBtn}
        >
          <Settings size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Header */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.profileRow}>
            <Avatar
              url={user?.avatar_url}
              name={user?.full_name || "Student"}
              size={72}
              showBorder
            />
            <View style={styles.profileMeta}>
              <View style={styles.nameRow}>
                <Text style={[styles.fullName, { color: colors.text }]}>
                  {user?.full_name || "Student"}
                </Text>
                {user?.is_top_student && <TopStudentBadge size="md" />}
              </View>
              <Text
                style={[styles.usernameText, { color: colors.textSecondary }]}
              >
                @{user?.username || "student"}
              </Text>

              {/* Controlled Responsive Academic Pill */}
              <View style={styles.academicPillRow}>
                <View
                  style={[
                    styles.academicPill,
                    { backgroundColor: colors.primaryLight + "20" },
                  ]}
                >
                  <Text
                    style={[styles.academicPillText, { color: colors.primary }]}
                  >
                    {user?.university?.short_name || "CU"} ·{" "}
                    {user?.major || "Computer Science"}
                  </Text>
                </View>
                {user?.year ? (
                  <View
                    style={[
                      styles.academicPill,
                      { backgroundColor: colors.primaryLight + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.academicPillText,
                        { color: colors.primary },
                      ]}
                    >
                      {user.year}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {user?.bio ? (
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>
              {user.bio}
            </Text>
          ) : null}

          {/* Academic Stats Grid */}
          <View
            style={[
              styles.statsGrid,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {formatGPA(user?.gpa)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                GPA
              </Text>
            </View>

            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {user?.reputation || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Reputation
              </Text>
            </View>

            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {user?.helpful_answers_count || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Helpful Solutions
              </Text>
            </View>

            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {user?.best_answers_count || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Best Answers
              </Text>
            </View>
          </View>

          {/* Edit Profile Action Button */}
          <TouchableOpacity
            onPress={() => router.push("/(onboarding)/complete-profile")}
            style={[
              styles.editBtn,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <Edit3 size={16} color={colors.text} />
            <Text style={[styles.editBtnText, { color: colors.text }]}>
              Edit Academic Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Top Student Qualification Progress if not yet qualified */}
        {!user?.is_top_student && (
          <View
            style={[
              styles.qualCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
              }}
            >
              <Award size={18} color={colors.primary} />
              <Text style={[styles.qualTitle, { color: colors.text }]}>
                Top Student Qualification Progress
              </Text>
            </View>
            <Text style={[styles.qualSub, { color: colors.textSecondary }]}>
              Reach 3.6+ GPA or 100+ Reputation to earn the Top Student Badge!
            </Text>

            {/* GPA Progress Bar */}
            <View style={{ marginTop: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text
                  style={[
                    styles.progressLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  GPA
                </Text>
                <Text style={[styles.progressValue, { color: colors.text }]}>
                  {formatGPA(user?.gpa)} / 3.6
                </Text>
              </View>
              <View
                style={[
                  styles.progressBarBg,
                  { backgroundColor: colors.surfaceSecondary },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${topStudentEval.progressToNext.gpaProgress}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Reputation Progress Bar */}
            <View style={{ marginTop: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text
                  style={[
                    styles.progressLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Reputation
                </Text>
                <Text style={[styles.progressValue, { color: colors.text }]}>
                  {user?.reputation || 0} / 100
                </Text>
              </View>
              <View
                style={[
                  styles.progressBarBg,
                  { backgroundColor: colors.surfaceSecondary },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${topStudentEval.progressToNext.repProgress}%`,
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Earned Badges Showcase */}
        <View style={styles.sectionMargin}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Earned Badges
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.badgeScroll}
          >
            {PREDEFINED_BADGES.map((badge) => (
              <View
                key={badge.slug}
                style={[
                  styles.badgeCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.badgeIconCircle,
                    { backgroundColor: badge.color + "20" },
                  ]}
                >
                  <Award size={24} color={badge.color} />
                </View>
                <Text style={[styles.badgeName, { color: colors.text }]}>
                  {badge.name}
                </Text>
                <Text
                  style={[styles.badgeDesc, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {badge.description}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Tabbed Content Header */}
        <View style={styles.tabHeader}>
          {[
            {
              id: "posts",
              label: `Questions (${userPosts?.length || user?.questions_count || 0})`,
            },
            {
              id: "answers",
              label: `Answers (${userAnswers?.length || user?.answers_count || 0})`,
            },
            { id: "saved", label: `Saved (${savedPosts?.length || 0})` },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                style={[
                  styles.tabPill,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.surfaceSecondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    { color: isSelected ? "#FFFFFF" : colors.textSecondary },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tabbed Content Output & Separate Empty States */}
        {activeTab === "posts" &&
          (isPostsLoading ? (
            <ActivityIndicator
              style={{ marginVertical: SPACING.lg }}
              color={colors.primary}
            />
          ) : userPosts && userPosts.length > 0 ? (
            userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPress={() => router.push(`/(main)/post/${post.id}` as any)}
                onDelete={() => {
                  refetchPosts();
                  refetchSaved();
                }}
              />
            ))
          ) : (
            <View
              style={[
                styles.emptyBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <HelpCircle size={36} color={colors.textMuted} />
              <Text style={[styles.emptyBoxTitle, { color: colors.text }]}>
                No Questions Posted Yet
              </Text>
              <Text
                style={[styles.emptyBoxSub, { color: colors.textSecondary }]}
              >
                Got stuck on homework or code? Ask your peers now.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(main)/ask")}
                style={[
                  styles.askActionBtn,
                  { backgroundColor: colors.primary },
                ]}
              >
                <PlusCircle size={16} color="#FFFFFF" />
                <Text style={styles.askActionText}>Ask First Question</Text>
              </TouchableOpacity>
            </View>
          ))}

        {activeTab === "answers" &&
          (isAnswersLoading ? (
            <ActivityIndicator
              style={{ marginVertical: SPACING.lg }}
              color={colors.primary}
            />
          ) : userAnswers && userAnswers.length > 0 ? (
            userAnswers.map((ans) => (
              <AnswerCard
                key={ans.id}
                answer={ans}
                postAuthorId={ans.post?.author_id}
                onRefresh={refetchAnswers}
              />
            ))
          ) : (
            <View
              style={[
                styles.emptyBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <MessageSquare size={36} color={colors.textMuted} />
              <Text style={[styles.emptyBoxTitle, { color: colors.text }]}>
                No Answers Yet
              </Text>
              <Text
                style={[styles.emptyBoxSub, { color: colors.textSecondary }]}
              >
                Help fellow students by answering questions in your subjects!
              </Text>
            </View>
          ))}

        {activeTab === "saved" &&
          (isSavedLoading ? (
            <ActivityIndicator
              style={{ marginVertical: SPACING.lg }}
              color={colors.primary}
            />
          ) : savedPosts && savedPosts.length > 0 ? (
            savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPress={() => router.push(`/(main)/post/${post.id}` as any)}
                onDelete={() => {
                  refetchPosts();
                  refetchSaved();
                }}
              />
            ))
          ) : (
            <View
              style={[
                styles.emptyBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Bookmark size={36} color={colors.textMuted} />
              <Text style={[styles.emptyBoxTitle, { color: colors.text }]}>
                No Saved Posts Yet
              </Text>
              <Text
                style={[styles.emptyBoxSub, { color: colors.textSecondary }]}
              >
                Bookmark helpful posts from the feed to review them here later!
              </Text>
            </View>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
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
    flexDirection: "row",
    alignItems: "center",
  },
  profileMeta: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  fullName: {
    fontSize: 18,
    fontWeight: "800",
  },
  usernameText: {
    fontSize: 13,
    marginTop: 2,
  },
  academicPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 6,
  },
  academicPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  academicPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: SPACING.md,
  },
  statsGrid: {
    flexDirection: "row",
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  editBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: SPACING.md,
    gap: 6,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  qualCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  qualTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  qualSub: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  sectionMargin: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: SPACING.md,
  },
  badgeScroll: {
    flexDirection: "row",
  },
  badgeCard: {
    width: 140,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: "center",
    marginRight: 10,
  },
  badgeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  badgeDesc: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
  },
  tabHeader: {
    flexDirection: "row",
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
    fontWeight: "600",
  },
  emptyBox: {
    alignItems: "center",
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginTop: SPACING.xs,
  },
  emptyBoxTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: SPACING.sm,
  },
  emptyBoxSub: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  askActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  askActionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
