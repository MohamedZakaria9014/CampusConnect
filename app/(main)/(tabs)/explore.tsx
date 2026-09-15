import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Search,
  GraduationCap,
  BookOpen,
  TrendingUp,
  ChevronRight,
  MapPin,
  X,
  Sparkles,
  HelpCircle,
  User as UserIcon,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useThemeStore } from "../../../src/store/useThemeStore";
import { Input } from "../../../src/components/ui/Input";
import { Avatar } from "../../../src/components/ui/Avatar";
import { TopStudentBadge } from "../../../src/components/ui/TopStudentBadge";
import { Skeleton } from "../../../src/components/ui/Skeleton";
import {
  fetchUniversities,
  fetchMajors,
  searchStudents,
  fetchTrendingTopics,
  TrendingTopic,
} from "../../../src/services/api.explore";
import { fetchPosts } from "../../../src/services/api.posts";
import { PostCard } from "../../../src/components/features/PostCard";
import { SPACING, RADIUS } from "../../../src/constants/theme";
import { useDebounce } from "../../../src/hooks/useDebounce";
import { queryKeys } from "../../../src/constants/queryKeys";

export default function ExploreScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [activeTab, setActiveTab] = useState<
    "all" | "questions" | "universities" | "courses" | "students"
  >("all");
  const [showMoreUnis, setShowMoreUnis] = useState(false);
  const [showMoreCourses, setShowMoreCourses] = useState(false);

  const UNI_LIMIT = 6;
  const COURSE_LIMIT = 8;

  const { data: universities, isLoading: isLoadingUniversities } = useQuery({
    queryKey: queryKeys.universities.all,
    queryFn: fetchUniversities,
    staleTime: Infinity, // Universities don't change during a session
  });

  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: queryKeys.majors.all,
    queryFn: () => fetchMajors(),
    staleTime: Infinity, // Majors don't change during a session
  });

  const { data: students } = useQuery({
    queryKey: queryKeys.users.search(debouncedQuery),
    queryFn: () => searchStudents(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  });

  // Resolve matching university IDs from cached list — avoids a sequential DB round-trip in fetchPosts
  const matchedUniIds = useMemo(() => {
    if (!debouncedQuery.trim() || !universities) return [];
    const q = debouncedQuery.toLowerCase().trim();
    return universities
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.short_name.toLowerCase().includes(q),
      )
      .map((u) => u.id);
  }, [debouncedQuery, universities]);

  const { data: searchedPosts } = useQuery({
    queryKey: queryKeys.posts.search(debouncedQuery),
    queryFn: () =>
      fetchPosts({ searchQuery: debouncedQuery, universityIds: matchedUniIds }),
    enabled: debouncedQuery.trim().length > 0,
  });

  const { data: subjectPosts, isLoading: isSubjectPostsLoading } = useQuery({
    queryKey: queryKeys.posts.bySubject(selectedSubject || ""),
    queryFn: () => fetchPosts({ subject: selectedSubject || undefined }),
    enabled: !!selectedSubject,
  });

  const { data: trendingTopics } = useQuery({
    queryKey: queryKeys.explore.trending(),
    queryFn: fetchTrendingTopics,
  });

  // Real-time filtering as student types
  const q = searchQuery.toLowerCase().trim();

  const filteredUniversities = (universities || []).filter(
    (u) =>
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.short_name.toLowerCase().includes(q) ||
      (u.location && u.location.toLowerCase().includes(q)),
  );

  const filteredCourses = (courses || []).filter(
    (c: any) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q),
  );

  const activeTrending = (trendingTopics || []).filter(
    (t) =>
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q),
  );

  // Paginated slices — show first N items, expand on demand
  const displayedUnis = showMoreUnis
    ? filteredUniversities
    : filteredUniversities.slice(0, UNI_LIMIT);
  const displayedCourses = showMoreCourses
    ? (filteredCourses as any[])
    : (filteredCourses as any[]).slice(0, COURSE_LIMIT);

  const insets = useSafeAreaInsets();

  // Quick auto-suggestions when typing
  const questionSuggestions = (searchedPosts || []).slice(0, 2);
  const uniSuggestions = filteredUniversities.slice(0, 2);
  const courseSuggestions = filteredCourses.slice(0, 2);
  const studentSuggestions = (students || []).slice(0, 2);
  const hasSuggestions =
    q.length > 0 &&
    showSuggestions &&
    (questionSuggestions.length > 0 ||
      uniSuggestions.length > 0 ||
      courseSuggestions.length > 0 ||
      studentSuggestions.length > 0);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title & Search Input */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Explore Campus
          </Text>
          <Input
            placeholder="Search universities, courses, topics, or students..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setShowSuggestions(true);
            }}
            iconPrefix={<Search size={18} color={colors.primary} />}
            iconSuffix={
              searchQuery.length > 0 || selectedSubject ? (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedSubject(null);
                    setShowSuggestions(false);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Clear search"
                >
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null
            }
            containerStyle={{ marginTop: SPACING.md }}
          />

          {/* Auto-Suggestion Floating Box */}
          {hasSuggestions && (
            <View
              style={[
                styles.suggestionsBox,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.suggestionsHeader}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Sparkles size={14} color={colors.primary} />
                  <Text
                    style={[
                      styles.suggestionsHeaderTitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Instant Suggestions
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowSuggestions(false)}>
                  <Text
                    style={[
                      styles.suggestionsCloseText,
                      { color: colors.textMuted },
                    ]}
                  >
                    Dismiss
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Questions Suggestions */}
              {questionSuggestions.map((post) => (
                <TouchableOpacity
                  key={`sug-post-${post.id}`}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setShowSuggestions(false);
                    router.push(`/(main)/post/${post.id}` as any);
                  }}
                >
                  <HelpCircle
                    size={15}
                    color={colors.primary}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[styles.suggestionText, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {post.title}
                  </Text>
                  <Text
                    style={[
                      styles.suggestionTag,
                      {
                        color: colors.primary,
                        backgroundColor: colors.primaryLight + "20",
                      },
                    ]}
                  >
                    Question
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Universities Suggestions */}
              {uniSuggestions.map((uni) => (
                <TouchableOpacity
                  key={`sug-uni-${uni.id}`}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setShowSuggestions(false);
                    router.push({
                      pathname: "/(main)/explore/university/[id]",
                      params: { id: uni.id },
                    } as any);
                  }}
                >
                  <GraduationCap
                    size={15}
                    color={colors.accent}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[styles.suggestionText, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {uni.name} ({uni.short_name})
                  </Text>
                  <Text
                    style={[
                      styles.suggestionTag,
                      {
                        color: colors.accent,
                        backgroundColor: colors.accent + "20",
                      },
                    ]}
                  >
                    Campus
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Course Suggestions */}
              {courseSuggestions.map((c: any) => (
                <TouchableOpacity
                  key={`sug-c-${c.id || c.name}`}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSelectedSubject(c.name);
                    setSearchQuery("");
                    setShowSuggestions(false);
                  }}
                >
                  <BookOpen
                    size={15}
                    color={colors.secondary}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[styles.suggestionText, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {c.name}
                  </Text>
                  <Text
                    style={[
                      styles.suggestionTag,
                      {
                        color: colors.secondary,
                        backgroundColor: colors.secondary + "20",
                      },
                    ]}
                  >
                    Subject
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Student Suggestions */}
              {studentSuggestions.map((s) => (
                <TouchableOpacity
                  key={`sug-stud-${s.id}`}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setShowSuggestions(false);
                    router.push(`/user/${s.id}` as any);
                  }}
                >
                  <UserIcon
                    size={15}
                    color={colors.textSecondary}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[styles.suggestionText, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {s.full_name} {s.is_top_student ? "⭐" : ""}
                  </Text>
                  <Text
                    style={[
                      styles.suggestionTag,
                      {
                        color: colors.textMuted,
                        backgroundColor: colors.surfaceSecondary,
                      },
                    ]}
                  >
                    @{s.username}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
        >
          {[
            { id: "all", label: "All" },
            {
              id: "questions",
              label: `Questions (${
                selectedSubject
                  ? subjectPosts?.length || 0
                  : searchQuery.trim()
                    ? searchedPosts?.length || 0
                    : "All"
              })`,
            },
            {
              id: "universities",
              label: `Universities (${filteredUniversities.length})`,
            },
            { id: "courses", label: `Subjects (${filteredCourses.length})` },
            { id: "students", label: "Students" },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.surfaceSecondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    { color: isSelected ? "#FFFFFF" : colors.textSecondary },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Subject Banner & Questions List */}
        {selectedSubject && (
          <View style={styles.sectionMargin}>
            <View
              style={[
                styles.selectedSubjectBanner,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.primary + "50",
                },
              ]}
            >
              <View
                style={[
                  styles.selectedSubjectIconBox,
                  { backgroundColor: colors.primaryLight + "25" },
                ]}
              >
                <BookOpen size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.selectedSubjectSubText,
                    { color: colors.primary },
                  ]}
                >
                  Selected Subject
                </Text>
                <Text
                  style={[styles.selectedSubjectTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {selectedSubject}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedSubject(null)}
                style={[
                  styles.clearSubjectBtn,
                  { backgroundColor: colors.surfaceSecondary },
                ]}
                accessibilityLabel="Clear subject filter"
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {isSubjectPostsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text
                  style={[styles.loadingText, { color: colors.textSecondary }]}
                >
                  Loading questions in {selectedSubject}...
                </Text>
              </View>
            ) : subjectPosts && subjectPosts.length > 0 ? (
              <View>
                <Text
                  style={[
                    styles.sectionTitleText,
                    { color: colors.text, marginBottom: SPACING.sm },
                  ]}
                >
                  Questions in {selectedSubject} ({subjectPosts.length})
                </Text>
                {subjectPosts.map((post) => (
                  <PostCard
                    key={`subj-post-${post.id}`}
                    post={post}
                    onPress={() =>
                      router.push(`/(main)/post/${post.id}` as any)
                    }
                  />
                ))}
              </View>
            ) : (
              <View
                style={[
                  styles.emptySubjectBox,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <BookOpen
                  size={36}
                  color={colors.textMuted}
                  style={{ marginBottom: 8 }}
                />
                <Text
                  style={[styles.emptySubjectTitle, { color: colors.text }]}
                >
                  No questions yet in {selectedSubject}
                </Text>
                <Text
                  style={[
                    styles.emptySubjectSub,
                    { color: colors.textSecondary },
                  ]}
                >
                  Be the first student to ask a question or share notes in this
                  subject!
                </Text>
                <TouchableOpacity
                  style={[
                    styles.askSubjectBtn,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => router.push("/(main)/ask" as any)}
                >
                  <Text style={styles.askSubjectBtnText}>
                    Ask in {selectedSubject}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Questions Search Results */}
        {(activeTab === "all" || activeTab === "questions") &&
          searchedPosts &&
          searchedPosts.length > 0 && (
            <View style={styles.sectionMargin}>
              <Text style={[styles.sectionTitleText, { color: colors.text }]}>
                Questions Found ({searchedPosts.length})
              </Text>
              {searchedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPress={() => router.push(`/(main)/post/${post.id}` as any)}
                />
              ))}
            </View>
          )}

        {/* Trending Academic Topics */}
        {(activeTab === "all" || activeTab === "courses") &&
          !searchQuery.trim() &&
          activeTrending.length > 0 && (
            <View
              style={[
                styles.cardSection,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.sectionHeader}>
                <TrendingUp size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Trending Academic Topics
                </Text>
              </View>

              {activeTrending.map((topic, idx) => (
                <TouchableOpacity
                  key={topic.id || idx}
                  onPress={() => {
                    if (topic.postId) {
                      router.push(`/(main)/post/${topic.postId}` as any);
                    } else {
                      router.push({
                        pathname: "/(main)/explore/subject/[name]",
                        params: { name: topic.title },
                      } as any);
                    }
                  }}
                  style={styles.topicRow}
                >
                  <View style={{ flex: 1, marginRight: SPACING.sm }}>
                    <Text
                      style={[styles.topicTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {topic.title}
                    </Text>
                    <Text
                      style={[
                        styles.topicCount,
                        {
                          color: topic.isTopStudent
                            ? colors.primary
                            : colors.textSecondary,
                          fontWeight: topic.isTopStudent ? "600" : "400",
                        },
                      ]}
                    >
                      {topic.count}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={colors.icon} />
                </TouchableOpacity>
              ))}
            </View>
          )}

        {/* Universities List */}
        {(activeTab === "all" || activeTab === "universities") && (
          <View style={styles.sectionMargin}>
            <Text style={[styles.sectionTitleText, { color: colors.text }]}>
              University Communities ({filteredUniversities.length})
            </Text>
            {isLoadingUniversities ? (
              <View>
                <Skeleton height={68} style={{ marginBottom: 8 }} />
                <Skeleton height={68} style={{ marginBottom: 8 }} />
                <Skeleton height={68} />
              </View>
            ) : (
              <>
                {displayedUnis.map((uni) => (
                  <TouchableOpacity
                    key={uni.id}
                    onPress={() =>
                      router.push({
                        pathname: "/(main)/explore/university/[id]",
                        params: { id: uni.id },
                      } as any)
                    }
                    style={[
                      styles.uniCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.uniLogoBox,
                        { backgroundColor: colors.primaryLight + "20" },
                      ]}
                    >
                      <GraduationCap size={24} color={colors.primary} />
                    </View>
                    <View style={styles.uniMeta}>
                      <Text style={[styles.uniName, { color: colors.text }]}>
                        {uni.name} ({uni.short_name})
                      </Text>
                      {uni.location ? (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                            marginTop: 2,
                          }}
                        >
                          <MapPin size={12} color={colors.textSecondary} />
                          <Text
                            style={[
                              styles.uniSub,
                              { color: colors.textSecondary, marginTop: 0 },
                            ]}
                          >
                            {uni.location}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <ChevronRight size={18} color={colors.icon} />
                  </TouchableOpacity>
                ))}
                {filteredUniversities.length > UNI_LIMIT && !showMoreUnis && (
                  <TouchableOpacity
                    onPress={() => setShowMoreUnis(true)}
                    style={styles.showMoreBtn}
                  >
                    <Text
                      style={[styles.showMoreText, { color: colors.primary }]}
                    >
                      Show {filteredUniversities.length - UNI_LIMIT} more
                      universities
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* Majors / Subjects List */}
        {(activeTab === "all" || activeTab === "courses") && (
          <View style={styles.sectionMargin}>
            <Text style={[styles.sectionTitleText, { color: colors.text }]}>
              Academic Subjects ({filteredCourses.length})
            </Text>
            {isLoadingCourses ? (
              <View>
                <Skeleton height={64} style={{ marginBottom: 8 }} />
                <Skeleton height={64} style={{ marginBottom: 8 }} />
                <Skeleton height={64} style={{ marginBottom: 8 }} />
                <Skeleton height={64} />
              </View>
            ) : (
              <>
                {displayedCourses.map((course: any) => {
                  return (
                    <TouchableOpacity
                      key={course.id || course.name}
                      onPress={() =>
                        router.push({
                          pathname: "/(main)/explore/subject/[name]",
                          params: { name: course.name },
                        } as any)
                      }
                      activeOpacity={0.7}
                      style={[
                        styles.courseCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.courseIconBox,
                          { backgroundColor: colors.secondary + "20" },
                        ]}
                      >
                        <BookOpen size={20} color={colors.secondary} />
                      </View>
                      <View style={styles.courseMeta}>
                        <Text
                          style={[styles.courseCode, { color: colors.text }]}
                        >
                          {course.name}
                        </Text>
                        <Text
                          style={[
                            styles.courseDept,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {course.category}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.primary,
                            fontWeight: "600",
                          }}
                        >
                          View Posts
                        </Text>
                        <ChevronRight size={16} color={colors.primary} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {filteredCourses.length > COURSE_LIMIT && !showMoreCourses && (
                  <TouchableOpacity
                    onPress={() => setShowMoreCourses(true)}
                    style={styles.showMoreBtn}
                  >
                    <Text
                      style={[styles.showMoreText, { color: colors.primary }]}
                    >
                      Show {filteredCourses.length - COURSE_LIMIT} more subjects
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* Students List */}
        {(activeTab === "all" || activeTab === "students") &&
          students &&
          students.length > 0 && (
            <View style={styles.sectionMargin}>
              <Text style={[styles.sectionTitleText, { color: colors.text }]}>
                Students Found ({students.length})
              </Text>
              {students.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  onPress={() => router.push(`/user/${student.id}` as any)}
                  style={[
                    styles.studentCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Avatar
                    url={student.avatar_url}
                    name={student.full_name}
                    size={44}
                  />
                  <View style={styles.studentMeta}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={[styles.studentName, { color: colors.text }]}
                      >
                        {student.full_name}
                      </Text>
                      {student.is_top_student && <TopStudentBadge size="sm" />}
                    </View>
                    <Text
                      style={[
                        styles.studentSub,
                        { color: colors.textSecondary },
                      ]}
                    >
                      @{student.username} · {student.major}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.icon} />
                </TouchableOpacity>
              ))}
            </View>
          )}
      </ScrollView>
    </View>
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
    fontWeight: "800",
  },
  tabScroll: {
    flexDirection: "row",
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
    fontWeight: "600",
  },
  cardSection: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  topicRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.xs + 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: "600",
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
    fontWeight: "800",
    marginBottom: SPACING.md,
  },
  uniCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  uniLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  uniMeta: {
    flex: 1,
  },
  uniName: {
    fontSize: 15,
    fontWeight: "700",
  },
  uniSub: {
    fontSize: 12,
    marginTop: 2,
  },
  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  courseIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  courseMeta: {
    flex: 1,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: "700",
  },
  courseDept: {
    fontSize: 12,
    marginTop: 2,
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "700",
  },
  studentSub: {
    fontSize: 12,
    marginTop: 2,
  },
  suggestionsBox: {
    marginTop: SPACING.xs,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.xs,
    marginBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  suggestionsHeaderTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  suggestionsCloseText: {
    fontSize: 11,
    fontWeight: "600",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  suggestionTag: {
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginLeft: 8,
    textTransform: "uppercase",
  },
  selectedSubjectBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  selectedSubjectIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedSubjectSubText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  selectedSubjectTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  clearSubjectBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptySubjectBox: {
    alignItems: "center",
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginTop: SPACING.xs,
  },
  emptySubjectTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  emptySubjectSub: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  askSubjectBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
  },
  askSubjectBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  showMoreBtn: {
    alignItems: "center",
    paddingVertical: SPACING.md,
    marginTop: SPACING.xs,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
