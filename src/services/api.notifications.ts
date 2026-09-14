import { supabase } from '../lib/supabase';
import { NotificationItem } from '../types/models';

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:profiles!notifications_actor_id_fkey(*, university:universities(*)),
      post:posts(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications from Supabase:', error.message);
    return [];
  }
  return (data || []) as NotificationItem[];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  if (error) {
    console.error('Error marking notification read:', error.message);
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  if (!userId) return;
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
  if (error) {
    console.error('Error marking all notifications read:', error.message);
    throw error;
  }
}

export async function clearAllNotifications(userId: string): Promise<void> {
  if (!userId) return;

  // 1. Try RPC clear_user_notifications
  try {
    const { error: rpcErr } = await (supabase.rpc as any)('clear_user_notifications', {
      p_user_id: userId,
    });
    if (!rpcErr) return;
    console.warn('RPC clear_user_notifications error, attempting table delete fallback:', rpcErr);
  } catch (err) {
    console.warn('RPC clear_user_notifications call failed:', err);
  }

  // 2. Direct table delete fallback
  const { error } = await supabase.from('notifications').delete().eq('user_id', userId);
  if (error) {
    console.error('Error clearing notifications:', error.message);
    throw error;
  }
}

export async function deleteNotification(notificationId: string, userId?: string): Promise<void> {
  if (!notificationId) return;

  // 1. Try RPC delete_notification
  if (userId) {
    try {
      const { error: rpcErr } = await (supabase.rpc as any)('delete_notification', {
        p_notification_id: notificationId,
        p_user_id: userId,
      });
      if (!rpcErr) return;
      console.warn('RPC delete_notification error, attempting table delete fallback:', rpcErr);
    } catch (err) {
      console.warn('RPC delete_notification call failed:', err);
    }
  }

  // 2. Direct table delete fallback
  const { error } = await supabase.from('notifications').delete().eq('id', notificationId);
  if (error) {
    console.error('Error deleting notification:', error.message);
    throw error;
  }
}

export async function createNotification(item: {
  user_id: string;
  actor_id: string;
  type: NotificationItem['type'];
  post_id?: string;
  comment_id?: string;
  conversation_id?: string;
  title: string;
  body: string;
}): Promise<void> {
  if (item.user_id === item.actor_id) return; // Do not notify oneself
  const { error } = await supabase.from('notifications').insert([item]);
  if (error) {
    console.error('Error creating notification in Supabase:', error.message);
  }
}

