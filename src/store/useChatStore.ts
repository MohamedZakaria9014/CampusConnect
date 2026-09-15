import { create } from "zustand";

interface ChatState {
  activeConversationId: string | null;
  activeChatUserId: string | null;
  unreadCount: number;
  typingUsers: Record<string, boolean>; // convId -> isTyping
  setActiveConversation: (
    convId: string | null,
    targetUserId?: string | null,
  ) => void;
  setUnreadCount: (count: number) => void;
  setTyping: (convId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  activeChatUserId: null,
  unreadCount: 0,
  typingUsers: {},
  setActiveConversation: (convId, targetUserId = null) =>
    set({ activeConversationId: convId, activeChatUserId: targetUserId }),
  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
  setTyping: (convId, isTyping) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [convId]: isTyping },
    })),
}));
