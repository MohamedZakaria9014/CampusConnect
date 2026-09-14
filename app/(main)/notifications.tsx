import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bell,
  Award,
  CheckCircle2,
  MessageSquare,
  ThumbsUp,
  UserPlus,
  HelpCircle,
  Trash2,
  X,
} from 'lucide-react-native';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  deleteNotification,
} from '../../src/services/api.notifications';
import { timeAgo } from '../../src/utils/formatters';
import { SPACING, RADIUS } from '../../src/constants/theme';
import { NotificationItem } from '../../src/types/models';
import { queryKeys } from '../../src/constants/queryKeys';

export default function NotificationsScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: queryKeys.notifications.list(user?.id),
    queryFn: () => (user?.id ? fetchNotifications(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const handleNotificationPress = async (item: NotificationItem) => {
    await markNotificationAsRead(item.id);
    refetch();
    if (item.conversation_id || item.type === 'new_message') {
      router.push(`/(main)/messages/${item.actor_id}` as any);
    } else if (item.post_id) {
      router.push(`/(main)/post/${item.post_id}` as any);
    } else if (item.actor_id) {
      router.push(`/user/${item.actor_id}` as any);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await markAllNotificationsAsRead(user.id);
      refetch();
    } catch {
      // Handled in service
    }
  };

  const handleClearAll = () => {
    if (!user?.id || !notifications || notifications.length === 0) return;
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to clear all your notifications? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Optimistically clear query cache
              queryClient.setQueryData(queryKeys.notifications.list(user.id), []);
              await clearAllNotifications(user.id);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to clear notifications');
              refetch();
            }
          },
        },
      ]
    );
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!user?.id) return;
    try {
      // Optimistically remove from query cache
      queryClient.setQueryData(
        queryKeys.notifications.list(user.id),
        (prev: NotificationItem[] | undefined) => (prev || []).filter((n) => n.id !== notificationId)
      );
      await deleteNotification(notificationId, user.id);
    } catch (err: any) {
      console.warn('Failed to delete notification:', err);
      refetch();
    }
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'new_post':
        return <HelpCircle size={18} color="#6366F1" />;
      case 'new_message':
        return <MessageSquare size={18} color="#0EA5E9" />;
      case 'answer_best':
        return <CheckCircle2 size={18} color="#10B981" />;
      case 'badge_earned':
        return <Award size={18} color="#6366F1" />;
      case 'answer_upvoted':
        return <ThumbsUp size={18} color="#0EA5E9" />;
      case 'new_follower':
        return <UserPlus size={18} color="#EC4899" />;
      case 'new_answer':
      default:
        return <MessageSquare size={18} color="#F59E0B" />;
    }
  };

  const unreadCount = (notifications || []).filter((n) => !n.is_read).length;
  const hasNotifications = (notifications || []).length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topHeader, { borderColor: colors.border }]}>
        <View style={styles.leftHeaderRow}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(main)/(tabs)'))}
            style={styles.iconBtn}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        </View>

        {hasNotifications ? (
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllRead} style={styles.headerActionBtn}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>Mark read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClearAll} style={styles.headerActionBtn}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.error || '#EF4444' }}>Clear all</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.75}
            style={[
              styles.notifCard,
              {
                backgroundColor: item.is_read ? colors.card : colors.primaryLight + '10',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.iconWrapper}>{getNotifIcon(item.type)}</View>

            <View style={styles.notifMeta}>
              <Text style={[styles.notifTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.notifBody, { color: colors.textSecondary }]}>{item.body}</Text>
              <Text style={[styles.notifTime, { color: colors.textMuted }]}>{timeAgo(item.created_at)}</Text>
            </View>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                handleDeleteNotification(item.id);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.deleteBtn}
            >
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={40} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>All caught up!</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              You have no new notifications right now.
            </Text>
          </View>
        }
      />
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
  leftHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerActionBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 6,
    alignSelf: 'center',
  },
  listContent: {
    padding: SPACING.lg,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  iconWrapper: {
    padding: 8,
    borderRadius: RADIUS.md,
    marginRight: SPACING.md,
  },
  notifMeta: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  notifBody: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    marginTop: 4,
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
