import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Trash2 } from 'lucide-react-native';
import { useThemeStore } from '../../../src/store/useThemeStore';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { useChatStore } from '../../../src/store/useChatStore';
import { fetchConversations, getUnreadMessagesCount, deleteConversation } from '../../../src/services/api.chat';
import { Avatar } from '../../../src/components/ui/Avatar';
import { timeAgo } from '../../../src/utils/formatters';
import { SPACING, RADIUS } from '../../../src/constants/theme';
import { queryKeys } from '../../../src/constants/queryKeys';
import { Conversation } from '../../../src/types/models';

export default function ConversationsListScreen() {
  const colors = useThemeStore((s) => s.colors);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: queryKeys.chat.conversations(user?.id),
    queryFn: () => (user?.id ? fetchConversations(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations(user.id) });
        refetch();
        getUnreadMessagesCount(user.id);
      }
    }, [user?.id, refetch, queryClient])
  );

  const handleDeleteConversation = useCallback(
    (item: Conversation) => {
      const otherMember = item.members?.find((m) => m.id !== user?.id) || item.members?.[0];
      const name = otherMember?.full_name || 'this student';

      Alert.alert(
        'Delete Conversation',
        `Are you sure you want to delete your conversation with ${name}? All messages will be permanently deleted.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              if (!user?.id) return;
              try {
                // Optimistically remove from list
                queryClient.setQueryData(
                  queryKeys.chat.conversations(user.id),
                  (prev: Conversation[] | undefined) => (prev || []).filter((c) => c.id !== item.id)
                );
                if (item.unread_count && item.unread_count > 0) {
                  const currentUnread = useChatStore.getState().unreadCount;
                  useChatStore.getState().setUnreadCount(Math.max(0, currentUnread - item.unread_count));
                }
                await deleteConversation(item.id, user.id);
                queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations(user.id) });
                getUnreadMessagesCount(user.id).catch(() => {});
              } catch (err: any) {
                Alert.alert('Error', err.message || 'Failed to delete conversation');
                refetch();
              }
            },
          },
        ]
      );
    },
    [user?.id, queryClient, refetch]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Direct real-time peer discussion & solutions
        </Text>
      </View>
    ),
    [colors]
  );

  const renderConversationItem = useCallback(
    ({ item }: { item: Conversation }) => {
      const otherMember = item.members?.find((m) => m.id !== user?.id) || item.members?.[0];
      if (!otherMember?.id) return null;

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onLongPress={() => handleDeleteConversation(item)}
          onPress={() => {
            if (item.unread_count && item.unread_count > 0) {
              const currentUnread = useChatStore.getState().unreadCount;
              useChatStore.getState().setUnreadCount(Math.max(0, currentUnread - item.unread_count));
              item.unread_count = 0;
            }
            queryClient.setQueryData(
              queryKeys.chat.conversations(user?.id),
              (prev: Conversation[] | undefined) => {
                if (!prev) return [];
                return prev.map((c) => (c.id === item.id ? { ...c, unread_count: 0 } : c));
              }
            );
            router.push(`/(main)/messages/${otherMember.id}` as any);
          }}
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

          <View style={styles.rightActionRow}>
            {item.unread_count && item.unread_count > 0 ? (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.unreadText}>{item.unread_count}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                handleDeleteConversation(item);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.deleteBtn}
            >
              <Trash2 size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [colors, router, user?.id, handleDeleteConversation, queryClient]
  );

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversationItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
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
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  rightActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  deleteBtn: {
    padding: 6,
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
