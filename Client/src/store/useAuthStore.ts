import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

type UserRole = 'super_admin' | 'election_creator' | 'voter';

interface Profile {
  id: string;
  role: UserRole;
  name: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  fetchProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      set({ profile: data });
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({ profile: null });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
}));
