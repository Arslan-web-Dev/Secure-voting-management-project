import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { ProfileRole } from '../types/models';

export interface AuthContextType {
  user: User | null;
  role: ProfileRole | null;
  isApproved: boolean | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isApproved: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});
