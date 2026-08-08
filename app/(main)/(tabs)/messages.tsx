import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { fetchConversations } from '../../../src/services/api.chat';
import { Avatar } from '../../../src/components/ui/Avatar';
import { timeAgo } from '../../../src/utils/formatters';
import { SPACING, RADIUS } from '../../../src/constants/theme';
import { Conversation } from '../../../src/types/models';

export default function ConversationsListScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => fetchConversations(user?.id || 'u1111111-1111-1111-1111-111111111111'),
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Direct real-time peer discussion & solutions
      </Text>
    </View>
  );

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const otherMember = item.members?.find((m) => m.id !== user?.id) || item.members?.[0];

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push(`/(main)/messages/${otherMember?.id || 'u2222222-2222-2222-2222-222222222222'}` as any)}
        style={[styles.convCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Avatar url={otherMember?.avatar_url} name={otherMember?.full_name || 'Student'} size={52} isOnline />

        <View style={styles.convMeta}>
          <View style={styles.topMetaRow}>
            <Text style={[styles.memberName, { color: colors.text }]}>
              {otherMember?.full_name || 'Student Peer'}
            </Text>
            <Text style={[styles.timeText, { color: colors.textMuted }]}>
              {timeAgo(item.last_message?.created_at || item.updated_at)}
            </Text>
          </View>

          <Text style={[styles.lastMsgText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.last_message?.content || 'Started academic discussion...'}
          </Text>
        </View>

        {item.unread_count && item.unread_count > 0 ? (
          <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.unreadText}>{item.unread_count}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MessageSquare size={40} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Conversations Yet</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Message any student from an answer or profile to collaborate!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  convMeta: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
  },
  lastMsgText: {
    fontSize: 13,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xxl,
    marginTop: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});
