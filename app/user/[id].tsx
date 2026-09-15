import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  UserPlus,
  UserCheck,
  MessageCircle,
  Award,
  Calculator,
  Code,
  Heart,
  CheckCircle2,
} from "lucide-react-native";
import { useThemeStore } from "../../src/store/useThemeStore";
import { useAuthStore } from "../../src/store/useAuthStore";
import {
  fetchUserProfile,
  checkIsFollowing,
  toggleFollowUser,
} from "../../src/services/api.auth";
import { fetchPosts } from "../../src/services/api.posts";
import { Avatar } from "../../src/components/ui/Avatar";
import { TopStudentBadge } from "../../src/components/ui/TopStudentBadge";
import { PostCard } from "../../src/components/features/PostCard";
import { PREDEFINED_BADGES, isBadgeEarned } from "../../src/constants/badges";
import { BadgesShowcaseModal } from "../../src/components/features/BadgesShowcaseModal";
import { formatGPA } from "../../src/utils/formatters";
import { SPACING, RADIUS } from "../../src/constants/theme";
import { queryKeys } from "../../src/constants/queryKeys";

export default function OtherUserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeStore();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  const [optimisticFollow, setOptimisticFollow] = useState<boolean | null>(
    null,
  );
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const isOwnProfile = currentUser?.id === id;

  const { data: student, isLoading } = useQuery({
    queryKey: queryKeys.users.profile(id),
    queryFn: () => fetchUserProfile(id as string),
  });

  const { data: followStatus, refetch: refetchFollow } = useQuery({
    queryKey: queryKeys.users.following(id as string, currentUser?.id),
    queryFn: () =>
      currentUser?.id && id
        ? checkIsFollowing(currentUser.id, id)
        : Promise.resolve(false),
    enabled: !!(currentUser?.id && id && !isOwnProfile),
  });

  const isFollowing =
    optimisticFollow !== null ? optimisticFollow : !!followStatus;

  const { data: posts } = useQuery({
    queryKey: queryKeys.posts.userPosts(id as string),
    queryFn: () => fetchPosts({ userId: id, currentUserId: currentUser?.id }),
  });

  const handleToggleFollow = async () => {
    if (!currentUser?.id) {
      Alert.alert("Sign In Required", "Please sign in to follow students.", [
        { text: "Sign In", onPress: () => router.push("/(auth)/login") },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }

    if (isOwnProfile) return;

    const prevState = isFollowing;
    const nextState = !prevState;
    setOptimisticFollow(nextState);

    try {
      await toggleFollowUser(currentUser.id, id as string, prevState);
      refetchFollow();
    } catch {
      setOptimisticFollow(null);
      Alert.alert("Error", "Failed to update follow status. Please try again.");
    }
  };

  const handleStartMessage = () => {
    if (!currentUser?.id) {
      Alert.alert("Sign In Required", "Please sign in to message students.", [
        { text: "Sign In", onPress: () => router.push("/(auth)/login") },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
    router.push(`/(main)/messages/${id}` as any);
  };

  if (isLoading || !student) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(main)/(tabs)")
            }
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.topHeader, { borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(main)/(tabs)")
          }
          style={styles.iconBtn}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {student.full_name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Header */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.profileRow}>
            <Avatar
              url={student.avatar_url}
              name={student.full_name}
              size={72}
              showBorder
            />
            <View style={styles.profileMeta}>
              <View style={styles.nameRow}>
                <Text style={[styles.fullName, { color: colors.text }]}>
                  {student.full_name}
                </Text>
                {student.is_top_student && <TopStudentBadge size="md" />}
              </View>
              <Text
                style={[styles.usernameText, { color: colors.textSecondary }]}
              >
                @{student.username}
              </Text>

              <Text
                style={[
                  styles.academicPill,
                  {
                    color: colors.primary,
                    backgroundColor: colors.primaryLight + "20",
                  },
                ]}
              >
                {[
                  student.university?.short_name || student.university?.name,
                  student.major,
                  student.year,
                ]
                  .filter(Boolean)
                  .join(" • ") || "Student"}
              </Text>
            </View>
          </View>

          {student.bio ? (
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>
              {student.bio}
            </Text>
          ) : null}

          {/* Action Buttons: Follow + Message or View Own Profile */}
          {isOwnProfile ? (
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => router.push("/(main)/(tabs)/profile" as any)}
                style={[
                  styles.followBtn,
                  { backgroundColor: colors.surfaceSecondary, flex: 1 },
                ]}
              >
                <Text style={[styles.actionBtnText, { color: colors.text }]}>
                  View Your Full Profile
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={handleToggleFollow}
                style={[
                  styles.followBtn,
                  {
                    backgroundColor: isFollowing
                      ? colors.surfaceSecondary
                      : colors.primary,
                  },
                ]}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={16} color={colors.text} />
                    <Text
                      style={[styles.actionBtnText, { color: colors.text }]}
                    >
                      Following
                    </Text>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} color="#FFFFFF" />
                    <Text style={[styles.actionBtnText, { color: "#FFFFFF" }]}>
                      Follow Student
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleStartMessage}
                style={[
                  styles.messageBtn,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <MessageCircle size={16} color="#FFFFFF" />
                <Text style={[styles.actionBtnText, { color: "#FFFFFF" }]}>
                  Direct Message
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Academic Stats Grid */}
          <View
            style={[
              styles.statsGrid,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {formatGPA(student.gpa)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                GPA
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {student.reputation || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Reputation
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {student.best_answers_count || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                Best Answers
              </Text>
            </View>
          </View>
        </View>

        {/* Earned Badges */}
        <View style={styles.sectionMargin}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: SPACING.sm,
            }}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, marginBottom: 0 },
              ]}
            >
              Badges & Honors
            </Text>
            <TouchableOpacity
              onPress={() => setShowBadgesModal(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.primary,
                }}
              >
                View All ({PREDEFINED_BADGES.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.badgeScroll}
          >
            {PREDEFINED_BADGES.map((badge) => {
              const earned = isBadgeEarned(badge.slug, student);
              const renderIcon = () => {
                const iconColor = earned ? badge.color : colors.textMuted;
                switch (badge.iconName) {
                  case "calculator":
                    return <Calculator size={22} color={iconColor} />;
                  case "code":
                    return <Code size={22} color={iconColor} />;
                  case "heart":
                    return <Heart size={22} color={iconColor} />;
                  case "check-circle":
                    return <CheckCircle2 size={22} color={iconColor} />;
                  default:
                    return <Award size={22} color={iconColor} />;
                }
              };

              return (
                <TouchableOpacity
                  key={badge.slug}
                  onPress={() => setShowBadgesModal(true)}
                  style={[
                    styles.badgeCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: earned ? badge.color : colors.border,
                      borderWidth: earned ? 1.5 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.badgeIconCircle,
                      {
                        backgroundColor: earned
                          ? badge.bgTint
                          : colors.surfaceSecondary,
                      },
                    ]}
                  >
                    {renderIcon()}
                  </View>
                  <Text style={[styles.badgeName, { color: colors.text }]}>
                    {badge.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: earned ? "#10B981" : colors.textMuted,
                      marginTop: 2,
                    }}
                  >
                    {earned ? "Earned" : "Locked"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Questions Asked by Student */}
        <View style={styles.sectionMargin}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Questions ({posts?.length || 0})
          </Text>
          {posts?.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPress={() => router.push(`/(main)/post/${post.id}` as any)}
            />
          ))}
        </View>
      </ScrollView>

      <BadgesShowcaseModal
        visible={showBadgesModal}
        onClose={() => setShowBadgesModal(false)}
        user={student}
        title={`${student.full_name}'s Badges`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  iconBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
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
  academicPill: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: SPACING.md,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: SPACING.md,
  },
  followBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  messageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "700",
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
  },
  statValue: {
    fontSize: 17,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
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
    width: 110,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: "center",
    marginRight: 10,
  },
  badgeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});
