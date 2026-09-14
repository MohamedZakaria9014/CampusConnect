import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, Flame, Sparkles, GraduationCap, Plus } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { fetchPosts } from '../../../src/services/api.posts';
import { PostCard } from '../../../src/components/features/PostCard';
import { Skeleton } from '../../../src/components/ui/Skeleton';
import { CATEGORIES, CategoryType } from '../../../src/constants/categories';
import { SPACING, RADIUS } from '../../../src/constants/theme';
import { queryKeys } from '../../../src/constants/queryKeys';
import { Post } from '../../../src/types/models';

export default function HomeFeedScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [filterMode, setFilterMode] = useState<'all' | 'trending' | 'unanswered'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: posts,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.posts.list(selectedCategory, filterMode, user?.id, user?.university_id),
    queryFn: () =>
      fetchPosts({
        category: selectedCategory,
        filter: filterMode,
        universityId: user?.university_id,
        currentUserId: user?.id,
      }),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderHeader = useCallback(
    () => (
      <View style={styles.listHeader}>
        {/* Top Bar Header */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={[styles.brandLogo, { backgroundColor: colors.primary }]}>
              <GraduationCap size={22} color="#FFFFFF" />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>Campus Connect</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(main)/notifications')}
            style={[styles.iconCircleBtn, { backgroundColor: colors.surfaceSecondary }]}
          >
            <Bell size={20} color={colors.text} />
            <View style={[styles.notifDot, { backgroundColor: colors.primary }]} />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs: For You / Trending / Unanswered */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            onPress={() => setFilterMode('all')}
            style={[
              styles.filterPill,
              filterMode === 'all' && { backgroundColor: colors.primary },
            ]}
          >
            <Sparkles size={14} color={filterMode === 'all' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.filterPillText, { color: filterMode === 'all' ? '#FFFFFF' : colors.textSecondary }]}>
              For You
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterMode('trending')}
            style={[
              styles.filterPill,
              filterMode === 'trending' && { backgroundColor: colors.primary },
            ]}
          >
            <Flame size={14} color={filterMode === 'trending' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[styles.filterPillText, { color: filterMode === 'trending' ? '#FFFFFF' : colors.textSecondary }]}>
              Trending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterMode('unanswered')}
            style={[
              styles.filterPill,
              filterMode === 'unanswered' && { backgroundColor: colors.primary },
            ]}
          >
            <Text style={[styles.filterPillText, { color: filterMode === 'unanswered' ? '#FFFFFF' : colors.textSecondary }]}>
              Needs Answer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subject Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected ? colors.primaryLight + '25' : colors.surfaceSecondary,
                    borderColor: isSelected ? colors.primary : 'transparent',
                  },
                ]}
              >
                <Text style={[styles.categoryChipText, { color: isSelected ? colors.primary : colors.text }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    ),
    [colors, filterMode, selectedCategory, router]
  );

  const insets = useSafeAreaInsets();

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const handlePostPress = useCallback(
    (postId: string) => {
      router.push(`/(main)/post/${postId}` as any);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <View style={{ paddingHorizontal: SPACING.lg }}>
        <PostCard post={item} onPress={() => handlePostPress(item.id)} />
      </View>
    ),
    [handlePostPress]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <FlatList
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.skeletonContainer}>
              <Skeleton height={180} style={{ marginBottom: 12 }} />
              <Skeleton height={180} style={{ marginBottom: 12 }} />
              <Skeleton height={180} />
            </View>
          ) : isError ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Failed to load questions</Text>
              <TouchableOpacity onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No questions found</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Be the first student to ask a question in this subject!
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(main)/ask')}
                style={[styles.retryBtn, { backgroundColor: colors.primary }]}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.retryText}>Ask Question</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  listHeader: {
    paddingTop: SPACING.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: 8,
    marginBottom: SPACING.md,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryScroll: {
    paddingLeft: SPACING.lg,
    marginBottom: SPACING.md,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  skeletonContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xxl,
    marginTop: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: SPACING.lg,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
