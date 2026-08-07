import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, GraduationCap, Users, BookOpen, MessageSquare } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '../../../../src/store/useThemeStore';
import { fetchUniversities, fetchCourses, fetchTopStudents } from '../../../../src/services/api.explore';
import { fetchPosts } from '../../../../src/services/api.posts';
import { PostCard } from '../../../../src/components/features/PostCard';
import { Avatar } from '../../../../src/components/ui/Avatar';
import { TopStudentBadge } from '../../../../src/components/ui/TopStudentBadge';
import { SPACING, RADIUS } from '../../../../src/constants/theme';

export default function UniversityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeStore();
  const router = useRouter();

  const { data: universities } = useQuery({
    queryKey: ['universities'],
    queryFn: fetchUniversities,
  });

  const university = universities?.find((u) => u.id === id) || universities?.[0];

  const { data: topStudents } = useQuery({
    queryKey: ['topStudents', id],
    queryFn: () => fetchTopStudents(id),
  });

  const { data: courses } = useQuery({
    queryKey: ['courses', id],
    queryFn: () => fetchCourses(id),
  });

  const { data: posts } = useQuery({
    queryKey: ['uniPosts', id],
    queryFn: () => fetchPosts({ universityId: id }),
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>{university?.short_name} Hub</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner & Logo Header */}
        <View style={[styles.bannerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.uniIconBox, { backgroundColor: colors.primary }]}>
            <GraduationCap size={36} color="#FFFFFF" />
          </View>
          <Text style={[styles.uniNameTitle, { color: colors.text }]}>{university?.name}</Text>
          <Text style={[styles.uniLocationText, { color: colors.textSecondary }]}>{university?.location}</Text>
        </View>

        {/* Top Students Section */}
        <View style={styles.sectionMargin}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Students ({topStudents?.length || 0})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studentsScroll}>
            {topStudents?.map((student) => (
              <TouchableOpacity
                key={student.id}
                onPress={() => router.push(`/user/${student.id}` as any)}
                style={[styles.studentPillCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Avatar url={student.avatar_url} name={student.full_name} size={48} />
                <Text style={[styles.studentPillName, { color: colors.text }]} numberOfLines={1}>
                  {student.full_name}
                </Text>
                <TopStudentBadge size="sm" showText={false} />
                <Text style={[styles.studentPillRep, { color: colors.textSecondary }]}>
                  {student.reputation} Rep
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Courses */}
        <View style={styles.sectionMargin}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>University Courses</Text>
          {courses?.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={[styles.courseRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <BookOpen size={20} color={colors.primary} />
              <View style={styles.courseMeta}>
                <Text style={[styles.courseCodeText, { color: colors.text }]}>
                  {course.code} - {course.name}
                </Text>
                <Text style={[styles.courseDeptText, { color: colors.textSecondary }]}>{course.department}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Community Questions */}
        <View style={styles.sectionMargin}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Questions</Text>
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
  bannerCard: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  uniIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  uniNameTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  uniLocationText: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionMargin: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  studentsScroll: {
    flexDirection: 'row',
  },
  studentPillCard: {
    width: 110,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  studentPillName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  studentPillRep: {
    fontSize: 11,
    marginTop: 2,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.xs,
    gap: 10,
  },
  courseMeta: {
    flex: 1,
  },
  courseCodeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  courseDeptText: {
    fontSize: 12,
    marginTop: 2,
  },
});
