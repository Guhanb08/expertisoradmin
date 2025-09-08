'use client';

import { useEffect, useState } from 'react';
import { useSupabaseUser } from './use-supabase-user';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  role: 'admin' | 'candidate' | 'client';
  userId: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export function useUserProfile() {
  const { user } = useSupabaseUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No profile found
            setProfile(null);
          } else {
            throw error;
          }
        } else {
          setProfile(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, supabase]);

  return { profile, loading, error };
}
