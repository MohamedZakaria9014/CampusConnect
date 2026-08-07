import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BookOpen } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '../../../../src/store/useThemeStore';
import { fetchCourses } from '../../../../src/services/api.explore';
import { fetchPosts } from '../../../../src/services/api.posts';
import { PostCard } from '../../../../src/components/features/PostCard';
import { SPACING, RADIUS } from '../../../../src/constants/theme';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeStore();
  const router = useRouter();

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => fetchCourses(),
  });

  const course = courses?.find((c) => c.id === id) || courses?.[0];

  const { data: posts } = useQuery({
    queryKey: ['coursePosts', id],
    queryFn: () => fetchPosts({ courseId: id }),
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topHeader, { borderColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(main)/explore' as any)}
          style={styles.iconBtn}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{course?.code || 'Course'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
            <BookOpen size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {course?.code} - {course?.name}
          </Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            {course?.department} • {course?.university?.short_name || 'CU'}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Course Questions ({posts?.length || 0})</Text>
        {posts?.map((post) => (
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
  card: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
});
