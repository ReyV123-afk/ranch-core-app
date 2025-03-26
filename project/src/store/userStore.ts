import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface UserState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateInterests: (interests: string[]) => Promise<void>;
  loadUserProfile: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  loadUserProfile: async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        set({ user: null, loading: false });
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        set({
          user: {
            id: authUser.id,
            email: authUser.email!,
            interests: profile.interests,
            isPremium: profile.is_premium,
          },
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      set({ loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await get().loadUserProfile();
  },

  signUp: async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{ id: data.user.id }]);

      if (profileError) throw profileError;
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },

  updateInterests: async (interests: string[]) => {
    const user = get().user;
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ interests })
        .eq('id', user.id);
      
      if (error) throw error;
      
      set({ user: { ...user, interests } });
    } catch (error) {
      console.error('Error updating interests:', error);
      throw error;
    }
  },
}));