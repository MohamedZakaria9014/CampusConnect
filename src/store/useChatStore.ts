import { create } from 'zustand';
import { Conversation, Message } from '../types/models';

interface ChatState {
  activeConversationId: string | null;
  unreadCount: number;
  typingUsers: Record<string, boolean>; // convId -> isTyping
  setActiveConversation: (convId: string | null) => void;
  setUnreadCount: (count: number) => void;
  setTyping: (convId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  unreadCount: 1,
  typingUsers: {},
  setActiveConversation: (convId) => set({ activeConversationId: convId }),
  setUnreadCount: (count) => set({ unreadCount: count }),
  setTyping: (convId, isTyping) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [convId]: isTyping },
    })),
}));
