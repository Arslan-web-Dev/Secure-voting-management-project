// Custom React Hooks
export { useAuth } from './useAuth';
export { useElections } from './useElections';
export { useLocalStorage } from './useLocalStorage';

// useAuth Hook
import { useAuthStore } from '@/store/useAuthStore';

export const useAuth = () => {
  const { user, profile, isLoading, setUser, setProfile, fetchProfile, signOut } = useAuthStore();
  
  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    setUser,
    setProfile,
    fetchProfile,
    signOut,
  };
};

// useElections Hook
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Election } from '@/types';

export const useElections = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchElections = async (filter?: { status?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase.from('elections').select('*');
      if (filter?.status) {
        query = query.eq('status', filter.status);
      }
      const { data, error: err } = await query;
      if (err) throw err;
      setElections(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch elections'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  return { elections, isLoading, error, fetchElections };
};

// useLocalStorage Hook
import { useState } from 'react';

export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (err) {
      console.error(err);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return [storedValue, setValue] as const;
};
