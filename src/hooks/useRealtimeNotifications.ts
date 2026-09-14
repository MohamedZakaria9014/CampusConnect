import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { getUnreadMessagesCount } from '../services/api.chat';
import { queryKeys } from '../constants/queryKeys';
import { scheduleLocalNotification } from '../lib/notifications';
import { NotificationItem } from '../types/models';

import { useChatStore } from '../store/useChatStore';
import { markNotificationAsRead } from '../services/api.notifications';

export function useRealtimeNotifications() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    // Initial unread messages count sync
    getUnreadMessagesCount(user.id).catch(() => {});

    // Subscribe to realtime notifications for the current user
    const channel = supabase
      .channel(`user_notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          if (!isMounted) return;
          const newNotif = payload.new as NotificationItem;

          // Check if user currently has this chat opened
          const activeConvId = useChatStore.getState().activeConversationId;
          const activeUserId = useChatStore.getState().activeChatUserId;
          const isChatOpenForThisNotif =
            newNotif.type === 'new_message' &&
            ((newNotif.conversation_id && newNotif.conversation_id === activeConvId) ||
              (newNotif.actor_id &&
                (newNotif.actor_id === activeUserId || newNotif.actor_id === activeConvId)));

          if (isChatOpenForThisNotif) {
            // User is actively inside this chat right now!
            // Suppress local notification, vibration/haptics, and auto-mark notification as read
            markNotificationAsRead(newNotif.id).catch(() => {});
            return;
          }

          // Invalidate notifications queries so badges and list update
          queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(user.id) });

          // Gentle haptic feedback
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

          // Local in-app notification alert if supported
          if (newNotif.title && newNotif.body) {
            scheduleLocalNotification(newNotif.title, newNotif.body, {
              postId: newNotif.post_id,
              conversationId: newNotif.conversation_id,
              type: newNotif.type,
            }).catch(() => {});
          }

          // If it's a message notification, re-sync unread messages count
          if (newNotif.type === 'new_message') {
            getUnreadMessagesCount(user.id).catch(() => {});
            queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations(user.id) });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
}
