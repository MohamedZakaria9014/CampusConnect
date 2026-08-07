import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Bell, Award, CheckCircle2, MessageSquare, ThumbsUp, UserPlus } from 'lucide-react-native';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { fetchNotifications, markNotificationAsRead } from '../../src/services/api.notifications';
import { Avatar } from '../../src/components/ui/Avatar';
import { timeAgo } from '../../src/utils/formatters';
import { SPACING, RADIUS } from '../../src/constants/theme';
import { NotificationItem } from '../../src/types/models';

export default function NotificationsScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => fetchNotifications(user?.id || 'u1111111-1111-1111-1111-111111111111'),
  });

  const handleNotificationPress = async (item: NotificationItem) => {
    await markNotificationAsRead(item.id);
    if (item.post_id) {
      router.push(`/(main)/post/${item.post_id}` as any);
    } else if (item.actor_id) {
      router.push(`/user/${item.actor_id}` as any);
    }
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topHeader, { borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleNotificationPress(item)}
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
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
