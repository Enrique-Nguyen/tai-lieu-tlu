import { createClient } from '@/lib/server';
import { cache } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'student' | 'moderator' | 'admin';
  status?: 'active' | 'banned';
  ban_reason?: string | null;
  banned_at?: string | null;
  academic_year: string | null;
  major: string | null;
  student_class: string | null;
  created_at: string;
}

/**
 * Get current authenticated user session and database profile.
 * Cached per request so multiple calls within the same render tree don't re-fetch.
 */
export const getCurrentUser = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { user: null, profile: null };
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      user,
      profile: (profile as UserProfile | null) ?? {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Sinh viên',
        avatar_url: user.user_metadata?.avatar_url || null,
        role: 'student',
        status: 'active',
        ban_reason: null,
        banned_at: null,
        academic_year: null,
        major: null,
        student_class: null,
        created_at: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return { user: null, profile: null };
  }
});
