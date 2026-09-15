import { supabase } from "../lib/supabase";
import { Conversation, Message } from "../types/models";
import { useChatStore } from "../store/useChatStore";

export async function fetchConversations(
  userId: string,
): Promise<Conversation[]> {
  const { data: memberRows, error: memberErr } = await supabase
    .from("conversation_members")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId);

  if (memberErr || !memberRows || memberRows.length === 0) {
    useChatStore.getState().setUnreadCount(0);
    return [];
  }

  const conversationIds = memberRows.map((m) => m.conversation_id);
  const lastReadMap = new Map<string, string | null>(
    memberRows.map((m) => [m.conversation_id, m.last_read_at]),
  );

  const [convRes, msgRes] = await Promise.all([
    supabase
      .from("conversations")
      .select(
        `
        *,
        members:conversation_members(user:profiles(*, university:universities(*)), last_read_at)
      `,
      )
      .in("id", conversationIds)
      .order("updated_at", { ascending: false }),
    supabase
      .from("messages")
      .select("*, sender:profiles(*, university:universities(*))")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false }),
  ]);

  if (convRes.error || !convRes.data) {
    return [];
  }

  const messagesByConv = new Map<string, Message[]>();
  for (const msg of (msgRes.data || []) as Message[]) {
    const list = messagesByConv.get(msg.conversation_id) || [];
    list.push(msg);
    messagesByConv.set(msg.conversation_id, list);
  }

  let totalUnread = 0;

  const result: Conversation[] = convRes.data.map((c: any) => {
    const convMessages = messagesByConv.get(c.id) || [];
    const lastMsg = convMessages[0];
    const myLastRead = lastReadMap.get(c.id);
    const myLastReadTime = myLastRead ? new Date(myLastRead).getTime() : 0;

    let unreadCount = 0;
    for (const msg of convMessages) {
      if (msg.sender_id !== userId) {
        if (new Date(msg.created_at).getTime() > myLastReadTime) {
          unreadCount++;
        }
      }
    }

    totalUnread += unreadCount;

    return {
      ...c,
      members: c.members?.map((m: any) => m.user).filter(Boolean) || [],
      last_message: lastMsg,
      unread_count: unreadCount,
    };
  });

  useChatStore.getState().setUnreadCount(totalUnread);
  return result;
}

export async function getUnreadMessagesCount(userId: string): Promise<number> {
  const { data: memberRows } = await supabase
    .from("conversation_members")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId);

  if (!memberRows || memberRows.length === 0) return 0;

  let total = 0;
  for (const m of memberRows) {
    let query = supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", m.conversation_id)
      .neq("sender_id", userId);

    if (m.last_read_at) {
      query = query.gt("created_at", m.last_read_at);
    }

    const { count } = await query;
    total += count || 0;
  }

  useChatStore.getState().setUnreadCount(total);
  return total;
}

export async function markConversationAsRead(
  conversationId: string,
  userId: string,
): Promise<void> {
  const now = new Date(Date.now() + 1000).toISOString();
  try {
    await (supabase.rpc as any)("mark_conversation_read", {
      p_conversation_id: conversationId,
      p_user_id: userId,
    });
  } catch {
    // Fallback to table update
  }

  await supabase
    .from("conversation_members")
    .update({ last_read_at: now })
    .match({ conversation_id: conversationId, user_id: userId });

  // Also auto-mark any pending notification for this conversation as read
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("conversation_id", conversationId);

  // Recalculate unread count asynchronously
  getUnreadMessagesCount(userId).catch(() => {});
}

export async function fetchMessages(
  conversationId: string,
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:profiles(*, university:universities(*))")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages from Supabase:", error.message);
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
    .from("messages")
    .insert([messageData])
    .select("*, sender:profiles(*, university:universities(*))")
    .single();

  if (error) {
    console.error("Error sending message to Supabase:", error.message);
    throw error;
  }

  // Update conversation updated_at
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", messageData.conversation_id);

  // Notify recipient(s) of this direct message
  try {
    const { data: otherMembers } = await supabase
      .from("conversation_members")
      .select("user_id")
      .eq("conversation_id", messageData.conversation_id)
      .neq("user_id", messageData.sender_id);

    if (otherMembers && otherMembers.length > 0) {
      const senderName = data.sender?.full_name || "A student peer";
      for (const m of otherMembers) {
        try {
          await (supabase.rpc as any)("send_notification", {
            p_user_id: m.user_id,
            p_actor_id: messageData.sender_id,
            p_type: "new_message",
            p_title: `Message from ${senderName}`,
            p_body:
              messageData.content ||
              (messageData.code_snippet
                ? "Shared code snippet"
                : "Sent an attachment"),
            p_post_id: null,
            p_conversation_id: messageData.conversation_id,
          });
        } catch {
          await supabase.from("notifications").insert([
            {
              user_id: m.user_id,
              actor_id: messageData.sender_id,
              type: "new_message" as const,
              conversation_id: messageData.conversation_id,
              title: `Message from ${senderName}`,
              body:
                messageData.content ||
                (messageData.code_snippet
                  ? "Shared code snippet"
                  : "Sent an attachment"),
            },
          ]);
        }
      }
    }
  } catch (notifErr) {
    console.warn("Could not insert message notification:", notifErr);
  }

  return {
    ...(data as Message),
    status: "delivered",
  };
}

export async function findOrCreateDirectConversation(
  currentUserId: string,
  targetUserIdOrConvId: string,
  postId?: string,
): Promise<Conversation | null> {
  // 1. Check if targetUserIdOrConvId is already a direct conversation ID
  const { data: directConv } = await supabase
    .from("conversations")
    .select(
      "*, members:conversation_members(user:profiles(*, university:universities(*)), last_read_at)",
    )
    .eq("id", targetUserIdOrConvId)
    .maybeSingle();

  if (directConv) {
    return {
      ...directConv,
      members: ((directConv as any).members || [])
        .map((m: any) => m.user)
        .filter(Boolean),
    } as Conversation;
  }

  // 2. Try atomic start_direct_conversation RPC
  try {
    const { data: convId, error: rpcErr } = await (supabase.rpc as any)(
      "start_direct_conversation",
      {
        p_user_one: currentUserId,
        p_user_two: targetUserIdOrConvId,
        p_post_id: postId || null,
      },
    );

    if (!rpcErr && convId) {
      const { data: conversation } = await supabase
        .from("conversations")
        .select(
          "*, members:conversation_members(user:profiles(*, university:universities(*)), last_read_at)",
        )
        .eq("id", convId)
        .single();

      if (conversation) {
        return {
          ...conversation,
          members: ((conversation as any).members || [])
            .map((m: any) => m.user)
            .filter(Boolean),
        } as Conversation;
      }
    }
  } catch (err) {
    console.warn("RPC start_direct_conversation error:", err);
  }

  // 3. Fallback: query conversation_members directly for an existing shared conversation
  try {
    const { data: myMemberships } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", currentUserId);

    if (myMemberships && myMemberships.length > 0) {
      const myConvIds = myMemberships.map((m) => m.conversation_id);
      const { data: shared } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .in("conversation_id", myConvIds)
        .eq("user_id", targetUserIdOrConvId)
        .limit(1)
        .maybeSingle();

      if (shared?.conversation_id) {
        const { data: conv } = await supabase
          .from("conversations")
          .select(
            "*, members:conversation_members(user:profiles(*, university:universities(*)), last_read_at)",
          )
          .eq("id", shared.conversation_id)
          .single();

        if (conv) {
          return {
            ...conv,
            members: ((conv as any).members || [])
              .map((m: any) => m.user)
              .filter(Boolean),
          } as Conversation;
        }
      }
    }
  } catch (fallbackErr) {
    console.warn("Fallback conversation query failed:", fallbackErr);
  }

  return null;
}

export async function deleteConversation(
  conversationId: string,
  userId: string,
): Promise<void> {
  if (!conversationId || !userId) return;

  // 1. Try atomic RPC delete_conversation
  try {
    const { error: rpcErr } = await (supabase.rpc as any)(
      "delete_conversation",
      {
        p_conversation_id: conversationId,
        p_user_id: userId,
      },
    );
    if (!rpcErr) return;
    console.warn(
      "RPC delete_conversation error, falling back to direct delete:",
      rpcErr,
    );
  } catch (err) {
    console.warn("RPC delete_conversation call failed:", err);
  }

  // 2. Direct delete on conversations table
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId);
  if (error) {
    // 3. Fallback: if user cannot delete conversation directly due to RLS, delete their membership
    const { error: memErr } = await supabase
      .from("conversation_members")
      .delete()
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
    if (memErr) {
      console.error("Error deleting conversation:", error.message);
      throw error;
    }
  }
}
