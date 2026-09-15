import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, BookOpen, Plus, MessageSquare } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useThemeStore } from "../../../../src/store/useThemeStore";
import { fetchPosts } from "../../../../src/services/api.posts";
import { fetchMajors } from "../../../../src/services/api.explore";
import { PostCard } from "../../../../src/components/features/PostCard";
import { Skeleton } from "../../../../src/components/ui/Skeleton";
import { SPACING, RADIUS } from "../../../../src/constants/theme";
import { queryKeys } from "../../../../src/constants/queryKeys";
import { Post } from "../../../../src/types/models";

export default function SubjectPostsScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const { colors } = useThemeStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const subjectName = decodeURIComponent(name || "");

  // Pull category from already-cached majors — zero extra network request
  const { data: majors } = useQuery({
    queryKey: queryKeys.majors.all,
    queryFn: () => fetchMajors(),
    staleTime: Infinity,
  });
  const major = majors?.find((m) => m.name === subjectName);

  const {
    data: posts,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.posts.bySubject(subjectName),
    queryFn: () => fetchPosts({ subject: subjectName }),
    enabled: !!subjectName,
  });

  const renderItem = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onPress={() => router.push(`/(main)/post/${item.id}` as any)}
    />
  );

  const keyExtractor = (item: Post) => item.id;

  const ListHeader = () => (
    <View>
      {/* Subject banner */}
      <View
        style={[
          styles.bannerCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.primaryLight + "25" },
          ]}
        >
          <BookOpen size={32} color={colors.primary} />
        </View>
        <Text style={[styles.subjectName, { color: colors.text }]}>
          {subjectName}
        </Text>
        {major?.category && (
          <View
            style={[
              styles.categoryPill,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[styles.categoryPillText, { color: colors.primary }]}>
              {major.category}
            </Text>
          </View>
        )}
        {!isLoading && (
          <Text
            style={[styles.postCountText, { color: colors.textSecondary }]}
          >
            {posts?.length || 0} question{posts?.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Questions
      </Text>

      {isLoading && (
        <View>
          <Skeleton height={160} style={{ marginBottom: 10 }} />
          <Skeleton height={160} style={{ marginBottom: 10 }} />
          <Skeleton height={160} />
        </View>
      )}

      {isError && (
        <View style={styles.centerBox}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Failed to load questions
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.actionBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const ListEmpty = () => {
    if (isLoading || isError) return null;
    return (
      <View style={styles.centerBox}>
        <MessageSquare
          size={48}
          color={colors.textMuted}
          style={{ marginBottom: 12 }}
        />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No questions yet
        </Text>
        <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
          Be the first to ask a question in {subjectName}!
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(main)/ask" as any)}
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>Ask in {subjectName}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {/* Top navigation bar */}
      <View style={[styles.topHeader, { borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(main)/(tabs)/explore" as any)
          }
          style={styles.iconBtn}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {subjectName}
        </Text>
        {/* Quick ask shortcut */}
        <TouchableOpacity
          onPress={() => router.push("/(main)/ask" as any)}
          style={[styles.askBtn, { backgroundColor: colors.primary }]}
        >
          <Plus size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={isLoading || isError ? [] : posts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  iconBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginHorizontal: SPACING.sm,
  },
  askBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: { padding: SPACING.lg, paddingBottom: 100 },
  bannerCard: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  subjectName: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: 8,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  postCountText: { fontSize: 14, fontWeight: "500" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: SPACING.md,
  },
  centerBox: { alignItems: "center", paddingVertical: SPACING.xxl },
  emptyTitle: { fontSize: 17, fontWeight: "700", marginBottom: 6 },
  emptySub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  actionBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});