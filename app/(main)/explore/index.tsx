import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, GraduationCap, BookOpen, TrendingUp, ChevronRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { Input } from '../../../src/components/ui/Input';
import { Avatar } from '../../../src/components/ui/Avatar';
import { TopStudentBadge } from '../../../src/components/ui/TopStudentBadge';
import { fetchUniversities, fetchCourses, searchStudents } from '../../../src/services/api.explore';
import { SPACING, RADIUS } from '../../../src/constants/theme';

export default function ExploreScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'universities' | 'courses' | 'students'>('all');

  const { data: universities } = useQuery({
    queryKey: ['universities'],
    queryFn: fetchUniversities,
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => fetchCourses(),
  });

  const { data: students } = useQuery({
    queryKey: ['searchStudents', searchQuery],
    queryFn: () => searchStudents(searchQuery),
    enabled: searchQuery.trim().length > 0,
  });

  const TRENDING_TOPICS = [
    { title: 'Stokes Theorem & Surface Integrals', count: '142 questions' },
    { title: 'Dijkstra vs A* Algorithm C++', count: '98 questions' },
    { title: 'Maxwell Equations Dielectric Boundary', count: '64 questions' },
    { title: 'Organic Chemistry Synthesis Mechanisms', count: '51 questions' },
  ];

  // Real-time filtering as student types
  const q = searchQuery.toLowerCase().trim();

  const filteredUniversities = (universities || []).filter(
    (u) =>
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.short_name.toLowerCase().includes(q) ||
      (u.location && u.location.toLowerCase().includes(q))
  );

  const filteredCourses = (courses || []).filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q)
  );

  const filteredTopics = TRENDING_TOPICS.filter(
    (t) => !q || t.title.toLowerCase().includes(q)
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Title & Search Input */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Explore Campus</Text>
          <Input
            placeholder="Search universities, courses, topics, or students..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            iconPrefix={<Search size={18} color={colors.primary} />}
            containerStyle={{ marginTop: SPACING.md }}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          {[
            { id: 'all', label: 'All' },
            { id: 'universities', label: `Universities (${filteredUniversities.length})` },
            { id: 'courses', label: `Courses (${filteredCourses.length})` },
            { id: 'students', label: 'Students' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                style={[
                  styles.tabChip,
                  { backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary },
                ]}
              >
                <Text style={[styles.tabChipText, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Trending Academic Topics */}
        {(activeTab === 'all' || activeTab === 'courses') && filteredTopics.length > 0 && (
          <View style={[styles.cardSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending Academic Topics</Text>
            </View>

            {filteredTopics.map((topic, idx) => (
              <TouchableOpacity key={idx} style={styles.topicRow}>
                <View>
                  <Text style={[styles.topicTitle, { color: colors.text }]}>{topic.title}</Text>
                  <Text style={[styles.topicCount, { color: colors.textSecondary }]}>{topic.count}</Text>
                </View>
                <ChevronRight size={16} color={colors.icon} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Universities List */}
        {(activeTab === 'all' || activeTab === 'universities') && (
          <View style={styles.sectionMargin}>
            <Text style={[styles.sectionTitleText, { color: colors.text }]}>
              University Communities ({filteredUniversities.length})
            </Text>
            {filteredUniversities.map((uni) => (
              <TouchableOpacity
                key={uni.id}
                onPress={() => router.push({ pathname: '/(main)/explore/university/[id]', params: { id: uni.id } } as any)}
                style={[styles.uniCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.uniLogoBox, { backgroundColor: colors.primaryLight + '20' }]}>
                  <GraduationCap size={24} color={colors.primary} />
                </View>
                <View style={styles.uniMeta}>
                  <Text style={[styles.uniName, { color: colors.text }]}>
                    {uni.name} ({uni.short_name})
                  </Text>
                  <Text style={[styles.uniSub, { color: colors.textSecondary }]}>📍 {uni.location}</Text>
                </View>
                <ChevronRight size={18} color={colors.icon} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Courses List */}
        {(activeTab === 'all' || activeTab === 'courses') && (
          <View style={styles.sectionMargin}>
            <Text style={[styles.sectionTitleText, { color: colors.text }]}>
              Academic Courses ({filteredCourses.length})
            </Text>
            {filteredCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                onPress={() => router.push({ pathname: '/(main)/explore/course/[id]', params: { id: course.id } } as any)}
                style={[styles.courseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.courseIconBox, { backgroundColor: colors.secondary + '20' }]}>
                  <BookOpen size={20} color={colors.secondary} />
                </View>
                <View style={styles.courseMeta}>
                  <Text style={[styles.courseCode, { color: colors.text }]}>
                    {course.code} - {course.name}
                  </Text>
                  <Text style={[styles.courseDept, { color: colors.textSecondary }]}>
                    {course.department} • {course.university?.short_name || 'CU'}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.icon} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Students List */}
        {(activeTab === 'all' || activeTab === 'students') && students && students.length > 0 && (
          <View style={styles.sectionMargin}>
            <Text style={[styles.sectionTitleText, { color: colors.text }]}>
              Students Found ({students.length})
            </Text>
            {students.map((student) => (
              <TouchableOpacity
                key={student.id}
                onPress={() => router.push(`/user/${student.id}` as any)}
                style={[styles.studentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Avatar url={student.avatar_url} name={student.full_name} size={44} />
                <View style={styles.studentMeta}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.studentName, { color: colors.text }]}>{student.full_name}</Text>
                    {student.is_top_student && <TopStudentBadge size="sm" />}
                  </View>
                  <Text style={[styles.studentSub, { color: colors.textSecondary }]}>
                    @{student.username} • {student.major}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.icon} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  tabScroll: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    marginRight: 8,
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardSection: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  topicCount: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionMargin: {
    marginBottom: SPACING.lg,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: SPACING.md,
  },
  uniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  uniLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  uniMeta: {
    flex: 1,
  },
  uniName: {
    fontSize: 15,
    fontWeight: '700',
  },
  uniSub: {
    fontSize: 12,
    marginTop: 2,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  courseIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  courseMeta: {
    flex: 1,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: '700',
  },
  courseDept: {
    fontSize: 12,
    marginTop: 2,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  studentMeta: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
  },
  studentSub: {
    fontSize: 12,
    marginTop: 2,
  },
});
