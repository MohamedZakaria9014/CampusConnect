import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import { ThumbsUp, MessageSquare, Bookmark, Share2, Eye, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Post } from '../../types/models';
import { useThemeStore } from '../../store/useThemeStore';
import { Avatar } from '../ui/Avatar';
import { TopStudentBadge } from '../ui/TopStudentBadge';
import { CodeBlock } from '../ui/CodeBlock';
import { Card } from '../ui/Card';
import { timeAgo, formatCount } from '../../utils/formatters';
import { SPACING, RADIUS } from '../../constants/theme';
import { togglePostLike, toggleSavePost } from '../../services/api.posts';
import { useAuthStore } from '../../store/useAuthStore';

export interface PostCardProps {
  post: Post;
  onPress?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPress }) => {
  const { colors } = useThemeStore();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [isLiked, setIsLiked] = React.useState(post.is_upvoted || false);
  const [likeCount, setLikeCount] = React.useState(post.upvotes_count || 0);
  const [isSaved, setIsSaved] = React.useState(post.is_saved || false);

  const author = post.author;
  const university = post.university || author?.university;

  const handleLike = async (e: any) => {
    e.stopPropagation();
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    if (user) {
      await togglePostLike(post.id, user.id, isLiked);
    }
  };

  const handleSave = async (e: any) => {
    e.stopPropagation();
    const nextState = !isSaved;
    setIsSaved(nextState);
    if (user) {
      await toggleSavePost(post.id, user.id, isSaved);
    }
  };

  const handleShare = async (e: any) => {
    e.stopPropagation();
    try {
      await Share.share({
        title: post.title,
        message: `Check out this academic question on Campus Connect: "${post.title}"`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handleUserPress = (e: any) => {
    e.stopPropagation();
    if (author?.id) {
      router.push(`/user/${author.id}` as any);
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <Card style={styles.card}>
        {/* Header: Author & Context */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleUserPress} style={styles.authorRow}>
            <Avatar url={author?.avatar_url} name={author?.full_name || 'Student'} size={42} />
            <View style={styles.authorDetails}>
              <View style={styles.nameBadgeRow}>
                <Text style={[styles.authorName, { color: colors.text }]}>
                  {author?.full_name || 'Anonymous Student'}
                </Text>
                {author?.is_top_student && <TopStudentBadge size="sm" />}
              </View>

              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                @{author?.username || 'user'} • {university?.short_name || 'CU'} • {author?.year || 'Student'}
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.timeAgo, { color: colors.textMuted }]}>{timeAgo(post.created_at)}</Text>
        </View>

        {/* Course Pill & Subject Category */}
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

        {/* Title & Body Content */}
        <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>
        <Text style={[styles.content, { color: colors.textSecondary }]} numberOfLines={3}>
          {post.content}
        </Text>

        {/* Code Snippet Attachment if present */}
        {post.code_snippet ? (
          <CodeBlock code={post.code_snippet} language={post.code_language || 'code'} />
        ) : null}

        {/* Image Attachment if present */}
        {post.image_urls && post.image_urls.length > 0 ? (
          <Image source={{ uri: post.image_urls[0] }} style={styles.postImage} />
        ) : null}

        {/* Footer Actions: Upvote, Answers, Save, Share */}
        <View style={[styles.footer, { borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.actionBtn, isLiked && { backgroundColor: colors.primary + '15' }]}
            onPress={handleLike}
          >
            <ThumbsUp size={16} color={isLiked ? colors.primary : colors.icon} />
            <Text style={[styles.actionText, { color: isLiked ? colors.primary : colors.textSecondary }]}>
              {formatCount(likeCount)}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionBtn}>
            <MessageSquare size={16} color={colors.icon} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {formatCount(post.answers_count)}
            </Text>
          </View>

          <View style={styles.actionBtn}>
            <Eye size={16} color={colors.icon} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {formatCount(post.views_count)}
            </Text>
          </View>

          <View style={styles.flexSpacer} />

          <TouchableOpacity style={styles.iconBtn} onPress={handleSave}>
            <Bookmark size={18} color={isSaved ? colors.warning : colors.icon} fill={isSaved ? colors.warning : 'transparent'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Share2 size={18} color={colors.icon} />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 12,
    marginTop: 2,
  },
  timeAgo: {
    fontSize: 12,
    marginLeft: 6,
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
    fontSize: 17,
    fontWeight: '700',
    marginVertical: 4,
    lineHeight: 22,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.xs,
    resizeMode: 'cover',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.xs + 4,
    borderTopWidth: 1,
    marginTop: SPACING.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginRight: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  flexSpacer: {
    flex: 1,
  },
  iconBtn: {
    padding: 6,
    marginLeft: 4,
  },
});
