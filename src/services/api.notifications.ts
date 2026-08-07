import { supabase } from '../lib/supabase';
import { NotificationItem } from '../types/models';

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:profiles(*, university:universities(*)),
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

export async function markNotificationAsRead(notificationId: string) {
  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
}
