import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { ProfileRecord, ProfileRole } from '../types/models';

const DEFAULT_PROFILE = {
  role: 'voter' as ProfileRole,
  isApproved: false,
};

const fetchProfileData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, is_approved')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    const profile = data as Pick<ProfileRecord, 'role' | 'is_approved'> | null;

    return {
      role: profile?.role ?? DEFAULT_PROFILE.role,
      isApproved: profile?.is_approved ?? DEFAULT_PROFILE.isApproved,
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return DEFAULT_PROFILE;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<ProfileRole | null>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    const profile = await fetchProfileData(user.id);
    setRole(profile.role);
    setIsApproved(profile.isApproved);
    setLoading(false);
  };

  useEffect(() => {
    let isActive = true;

    const syncProfile = async (nextUser: User | null) => {
      if (!nextUser) {
        if (isActive) {
          setRole(null);
          setIsApproved(null);
          setLoading(false);
        }
        return;
      }

      const profile = await fetchProfileData(nextUser.id);

      if (!isActive) {
        return;
      }

      setRole(profile.role);
      setIsApproved(profile.isApproved);
      setLoading(false);
    };

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isActive) {
        return;
      }

      const nextUser = session?.user ?? null;
      setUser(nextUser);
      void syncProfile(nextUser);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive) {
        return;
      }

      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        setLoading(true);
      }

      void syncProfile(nextUser);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, role, isApproved, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
