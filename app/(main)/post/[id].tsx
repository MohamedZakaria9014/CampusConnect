import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MessageSquare, Send, Code, Award, CheckCircle2 } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { fetchPostById } from '../../../src/services/api.posts';
import { fetchAnswersForPost, createAnswer } from '../../../src/services/api.answers';
import { AnswerCard } from '../../../src/components/features/AnswerCard';
import { Avatar } from '../../../src/components/ui/Avatar';
import { TopStudentBadge } from '../../../src/components/ui/TopStudentBadge';
import { CodeBlock } from '../../../src/components/ui/CodeBlock';
import { Button } from '../../../src/components/ui/Button';
import { timeAgo, formatCount } from '../../../src/utils/formatters';
import { SPACING, RADIUS } from '../../../src/constants/theme';
import { AnswerSortOption, CommentAnswer } from '../../../src/types/models';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeStore();
  const router = useRouter();
  const user = useAuthStore((s: any) => s.user);

  const [sortOption, setSortOption] = useState<AnswerSortOption>('best');
  const [answerText, setAnswerText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('cpp');
  const [showCode, setShowCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: post, isLoading: postLoading, refetch: refetchPost } = useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPostById(id as string),
  });

  const { data: answers, isLoading: answersLoading, refetch: refetchAnswers } = useQuery({
    queryKey: ['answers', id, sortOption],
    queryFn: () => fetchAnswersForPost(id as string, sortOption),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchPost(), refetchAnswers()]);
    setRefreshing(false);
  };

  const handlePostAnswer = async () => {
    if (!answerText.trim()) return;
    setIsSubmitting(true);
    try {
      await createAnswer({
        post_id: id as string,
        author_id: user?.id || 'u1111111-1111-1111-1111-111111111111',
        content: answerText,
        code_snippet: codeSnippet || undefined,
        code_language: codeLanguage,
        author: user || undefined,
      });

      setAnswerText('');
      setCodeSnippet('');
      setShowCode(false);
      refetchAnswers();
      refetchPost();
    } catch (e) {
      console.warn('Post answer error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (postLoading || !post) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingCenter}>
          <Text style={{ color: colors.textSecondary }}>Loading question...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const author = post.author;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Top Bar Header */}
        <View style={[styles.topHeader, { borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            Question Details
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {/* Main Question Card */}
          <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.authorHeader}>
              <Avatar url={author?.avatar_url} name={author?.full_name || 'Student'} size={46} />
              <View style={styles.authorMeta}>
                <View style={styles.nameRow}>
                  <Text style={[styles.authorName, { color: colors.text }]}>{author?.full_name}</Text>
                  {author?.is_top_student && <TopStudentBadge size="sm" />}
                </View>
                <Text style={[styles.subMeta, { color: colors.textSecondary }]}>
                  @{author?.username} • {author?.university?.short_name || 'CU'} • {author?.major}
                </Text>
              </View>
              <Text style={[styles.timeAgo, { color: colors.textMuted }]}>{timeAgo(post.created_at)}</Text>
            </View>

            <View style={styles.pillRow}>
              {post.course && (
                <View style={[styles.coursePill, { backgroundColor: colors.primaryLight + '20' }]}>
                  <Text style={[styles.coursePillText, { color: colors.primary }]}>{post.course.code}</Text>
                </View>
              )}
              <View style={[styles.categoryPill, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.categoryPillText, { color: colors.textSecondary }]}>{post.category}</Text>
              </View>
              {post.is_solved && (
                <View style={[styles.solvedPill, { backgroundColor: '#10B98120' }]}>
                  <CheckCircle2 size={12} color="#10B981" />
                  <Text style={[styles.solvedPillText, { color: '#10B981' }]}>Solved</Text>
                </View>
              )}
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>
            <Text style={[styles.content, { color: colors.textSecondary }]}>{post.content}</Text>

            {post.code_snippet ? (
              <CodeBlock code={post.code_snippet} language={post.code_language || 'code'} />
            ) : null}

            {post.image_urls && post.image_urls.length > 0 ? (
              <Image source={{ uri: post.image_urls[0] }} style={styles.postImage} />
            ) : null}
          </View>

          {/* Answers Section Header & Ranking Sort Selector */}
          <View style={styles.answersHeader}>
            <Text style={[styles.answersTitle, { color: colors.text }]}>
              Answers ({answers?.length || 0})
            </Text>

            {/* Answer Sort Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
              {[
                { id: 'best', label: 'Best Ranking' },
                { id: 'upvoted', label: 'Most Upvoted' },
                { id: 'top_students', label: 'Top Students' },
                { id: 'newest', label: 'Newest' },
              ].map((opt) => {
                const isSelected = sortOption === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setSortOption(opt.id as AnswerSortOption)}
                    style={[
                      styles.sortPill,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <Text style={[styles.sortPillText, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* List of Answers */}
          {answers && answers.length > 0 ? (
            answers.map((ans: CommentAnswer) => (
              <AnswerCard
                key={ans.id}
                answer={ans}
                postAuthorId={post.author_id}
                onRefresh={onRefresh}
              />
            ))
          ) : (
            <View style={styles.noAnswersBox}>
              <MessageSquare size={32} color={colors.textMuted} />
              <Text style={[styles.noAnswersText, { color: colors.textSecondary }]}>
                No answers yet. Be the first to help {author?.full_name || 'this student'}!
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Sticky Answer Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Write a clear academic solution..."
              placeholderTextColor={colors.textMuted}
              value={answerText}
              onChangeText={setAnswerText}
              multiline
              style={[styles.answerInput, { color: colors.text }]}
            />
            <TouchableOpacity onPress={() => setShowCode(!showCode)} style={styles.codeToggleBtn}>
              <Code size={20} color={showCode ? colors.primary : colors.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePostAnswer}
              disabled={isSubmitting || !answerText.trim()}
              style={[styles.sendBtn, { backgroundColor: answerText.trim() ? colors.primary : colors.surfaceSecondary }]}
            >
              <Send size={18} color={answerText.trim() ? '#FFFFFF' : colors.textMuted} />
            </TouchableOpacity>
          </View>

          {showCode && (
            <View style={[styles.codeBox, { backgroundColor: colors.codeBg }]}>
              <TextInput
                placeholder="// Paste code snippet..."
                placeholderTextColor="#9CA3AF"
                value={codeSnippet}
                onChangeText={setCodeSnippet}
                multiline
                style={[styles.codeInput, { color: colors.codeText }]}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
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
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  questionCard: {
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  authorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  authorMeta: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
  },
  subMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  timeAgo: {
    fontSize: 12,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  coursePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  coursePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  solvedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  solvedPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 6,
    lineHeight: 26,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.xs,
  },
  answersHeader: {
    marginBottom: SPACING.md,
  },
  answersTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  sortScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  sortPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: 6,
  },
  sortPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noAnswersBox: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  noAnswersText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  inputBar: {
    padding: SPACING.md,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  answerInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 14,
    paddingRight: 8,
  },
  codeToggleBtn: {
    padding: 8,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  codeBox: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginTop: 8,
  },
  codeInput: {
    fontSize: 13,
    minHeight: 60,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
});
