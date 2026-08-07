import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ArrowBigUp, ArrowBigDown, CheckCircle2, MessageCircle, MessageSquare } from 'lucide-react-native';
import { CommentAnswer } from '../../types/models';
import { useThemeStore } from '../../store/useThemeStore';
import { Avatar } from '../ui/Avatar';
import { TopStudentBadge } from '../ui/TopStudentBadge';
import { CodeBlock } from '../ui/CodeBlock';
import { timeAgo, formatGPA } from '../../utils/formatters';
import { SPACING, RADIUS } from '../../constants/theme';
import { voteAnswer, markBestAnswer } from '../../services/api.answers';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'expo-router';

export interface AnswerCardProps {
  answer: CommentAnswer;
  postAuthorId?: string;
  onRefresh?: () => void;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({ answer, postAuthorId, onRefresh }) => {
  const { colors } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const [voteState, setVoteState] = React.useState<number>(answer.user_vote || 0);
  const [upvotesCount, setUpvotesCount] = React.useState<number>(answer.upvotes_count || 0);
  const [isBest, setIsBest] = React.useState<boolean>(answer.is_best_answer || false);

  const author = answer.author;
  const isPostAuthor = user?.id === postAuthorId;

  const handleVote = async (targetVote: 1 | -1) => {
    if (!user) return;
    const nextVote = voteState === targetVote ? 0 : targetVote;
    const delta = nextVote - voteState;

    setVoteState(nextVote);
    setUpvotesCount((prev) => prev + delta);

    await voteAnswer(answer.id, user.id, nextVote as any);
  };

  const handleMarkBest = async () => {
    setIsBest(true);
    await markBestAnswer(answer.post_id, answer.id);
    if (onRefresh) onRefresh();
  };

  const handleStartChat = () => {
    if (author?.id) {
      router.push(`/messages/${author.id}?postId=${answer.post_id}` as any);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isBest ? colors.accent : colors.border,
          borderWidth: isBest ? 2 : 1,
        },
      ]}
    >
      {/* Best Answer Banner */}
      {isBest && (
        <View style={[styles.bestBanner, { backgroundColor: colors.accent + '20' }]}>
          <CheckCircle2 size={16} color={colors.accent} />
          <Text style={[styles.bestBannerText, { color: colors.accent }]}>BEST ANSWER SELECTED BY AUTHOR</Text>
        </View>
      )}

      {/* Header: Author Info */}
      <View style={styles.header}>
        <Avatar url={author?.avatar_url} name={author?.full_name || 'Student'} size={40} />
        <View style={styles.authorMeta}>
          <View style={styles.nameRow}>
            <Text style={[styles.authorName, { color: colors.text }]}>{author?.full_name || 'Student'}</Text>
            {author?.is_top_student && <TopStudentBadge size="sm" />}
          </View>
          <Text style={[styles.subMeta, { color: colors.textSecondary }]}>
            GPA: {formatGPA(author?.gpa)} • Rep: {author?.reputation || 0} • {author?.major || 'Student'}
          </Text>
        </View>

        <Text style={[styles.timeText, { color: colors.textMuted }]}>{timeAgo(answer.created_at)}</Text>
      </View>

      {/* Answer Content */}
      <Text style={[styles.content, { color: colors.text }]}>{answer.content}</Text>

      {/* Code Snippet if present */}
      {answer.code_snippet ? (
        <CodeBlock code={answer.code_snippet} language={answer.code_language || 'code'} />
      ) : null}

      {/* Image attachments if present */}
      {answer.image_urls && answer.image_urls.length > 0 ? (
        <Image source={{ uri: answer.image_urls[0] }} style={styles.answerImage} />
      ) : null}

      {/* Footer Controls */}
      <View style={[styles.footer, { borderColor: colors.border }]}>
        {/* Upvote & Downvote Pill */}
        <View style={[styles.voteContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <TouchableOpacity onPress={() => handleVote(1)} style={styles.voteBtn}>
            <ArrowBigUp size={20} color={voteState === 1 ? colors.primary : colors.icon} fill={voteState === 1 ? colors.primary : 'transparent'} />
          </TouchableOpacity>
          <Text style={[styles.voteCountText, { color: voteState !== 0 ? colors.primary : colors.text }]}>
            {upvotesCount}
          </Text>
          <TouchableOpacity onPress={() => handleVote(-1)} style={styles.voteBtn}>
            <ArrowBigDown size={20} color={voteState === -1 ? colors.error : colors.icon} fill={voteState === -1 ? colors.error : 'transparent'} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleStartChat} style={styles.directChatBtn}>
          <MessageCircle size={16} color={colors.primary} />
          <Text style={[styles.directChatText, { color: colors.primary }]}>Message Student</Text>
        </TouchableOpacity>

        <View style={styles.flexSpacer} />

        {/* Mark Best Answer Action for Post Author */}
        {isPostAuthor && !isBest && (
          <TouchableOpacity onPress={handleMarkBest} style={[styles.markBestBtn, { backgroundColor: colors.accent }]}>
            <CheckCircle2 size={14} color="#FFFFFF" />
            <Text style={styles.markBestText}>Mark Best</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  bestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    gap: 6,
  },
  bestBannerText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
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
    fontSize: 15,
    fontWeight: '700',
  },
  subMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    marginVertical: SPACING.xs,
  },
  answerImage: {
    width: '100%',
    height: 160,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.xs + 4,
    borderTopWidth: 1,
    marginTop: SPACING.xs,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  voteBtn: {
    padding: 4,
  },
  voteCountText: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  directChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
    gap: 4,
  },
  directChatText: {
    fontSize: 13,
    fontWeight: '600',
  },
  flexSpacer: {
    flex: 1,
  },
  markBestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  markBestText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
