import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Profile } from '../types/models';
import { fetchUserProfile, updateUserProfile } from '../services/api.auth';
import { CustomStorageAdapter } from '../lib/supabase';

interface AuthState {
  session: any | null;
  user: Profile | null;
  isLoading: boolean;
  isOnboarded: boolean;
  setSession: (session: any | null) => void;
  setUser: (user: Profile | null) => void;
  loadUserProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      isLoading: false,
      isOnboarded: false,

      setSession: (session) => {
        set({ session });
      },

      setUser: (user) => {
        set({
          user,
          isOnboarded: !!(user?.university_id && user?.major),
        });
      },

      loadUserProfile: async (userId: string) => {
        set({ isLoading: true });
        try {
          const profile = await fetchUserProfile(userId);
          set({
            user: profile,
            isOnboarded: !!(profile?.university_id && profile?.major),
            isLoading: false,
          });
        } catch (e) {
          set({ isLoading: false });
        }
      },

      updateProfile: async (updates: Partial<Profile>) => {
        const current = get().user;
        if (!current) return;
        set({ isLoading: true });
        try {
          const updated = await updateUserProfile(current.id, updates);
          set({
            user: updated,
            isOnboarded: !!(updated.university_id && updated.major),
            isLoading: false,
          });
        } catch (e) {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ session: null, user: null, isOnboarded: false });
      },
    }),
    {
      name: 'campus-connect-auth-store',
      storage: createJSONStorage(() => CustomStorageAdapter),
    }
  )
);
