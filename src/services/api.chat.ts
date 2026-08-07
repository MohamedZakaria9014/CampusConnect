import { supabase } from '../lib/supabase';
import { Conversation, Message } from '../types/models';

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const { data: memberRows, error: memberErr } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', userId);

  if (memberErr || !memberRows || memberRows.length === 0) {
    return [];
  }

  const conversationIds = memberRows.map((m) => m.conversation_id);

  const { data: conversations, error: convErr } = await supabase
    .from('conversations')
    .select(`
      *,
      members:conversation_members(user:profiles(*, university:universities(*)))
    `)
    .in('id', conversationIds)
    .order('updated_at', { ascending: false });

  if (convErr || !conversations) {
    return [];
  }

  return conversations.map((c: any) => ({
    ...c,
    members: c.members?.map((m: any) => m.user) || [],
  }));
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles(*, university:universities(*))')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages from Supabase:', error.message);
    return [];
  }

  return (data || []) as Message[];
}

export async function sendMessage(messageData: {
  conversation_id: string;
  sender_id: string;
  content?: string;
  image_url?: string;
  code_snippet?: string;
  code_language?: string;
}): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert([messageData])
    .select('*, sender:profiles(*, university:universities(*))')
    .single();

  if (error) {
    console.error('Error sending message to Supabase:', error.message);
    throw error;
  }

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', messageData.conversation_id);

  return data as Message;
}

export async function findOrCreateDirectConversation(
  currentUserId: string,
  targetUserId: string,
  postId?: string
): Promise<Conversation | null> {
  const { data: convs } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', currentUserId);

  if (convs && convs.length > 0) {
    const convIds = convs.map((c) => c.conversation_id);
    const { data: match } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .in('conversation_id', convIds)
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (match) {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*, members:conversation_members(user:profiles(*))')
        .eq('id', match.conversation_id)
        .single();

      if (conversation) return conversation as Conversation;
    }
  }

  const { data: newConv, error: newConvErr } = await supabase
    .from('conversations')
    .insert([{ is_group: false, post_id: postId }])
    .select('*')
    .single();

  if (newConv) {
    await supabase.from('conversation_members').insert([
      { conversation_id: newConv.id, user_id: currentUserId },
      { conversation_id: newConv.id, user_id: targetUserId },
    ]);
    return newConv as Conversation;
  }

  return null;
}
