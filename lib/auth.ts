import { createClient } from '@/lib/server';
import { cache } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'student' | 'moderator' | 'admin';
  status?: 'active' | 'suspended' | 'banned';
  ban_reason?: string | null;
  banned_at?: string | null;
  suspended_until?: string | null;
  academic_year: string | null;
  major: string | null;
  student_class: string | null;
  created_at: string;
}

/**
 * Get current authenticated user session and database profile.
 * Cached per request so multiple calls within the same render tree don't re-fetch.
 * Automatically checks and expires temporary suspensions if NOW() >= suspended_until.
 */
export const getCurrentUser = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { user: null, profile: null };
    }

    const { data: profileRaw } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    let profile = profileRaw as UserProfile | null;

    // Check if user is suspended and suspended_until has passed -> auto reinstatement
    if (profile && profile.status === 'suspended' && profile.suspended_until) {
      const now = new Date();
      const expireTime = new Date(profile.suspended_until);

      if (now >= expireTime) {
        // Expiration time passed: automatically restore status to active
        await supabase
          .from('users')
          .update({
            status: 'active',
            suspended_until: null,
            ban_reason: null,
          })
          .eq('id', user.id);

        profile.status = 'active';
        profile.suspended_until = null;
        profile.ban_reason = null;
      }
    }

    return {
      user,
      profile: profile ?? {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Sinh viên',
        avatar_url: user.user_metadata?.avatar_url || null,
        role: 'student',
        status: 'active',
        ban_reason: null,
        banned_at: null,
        suspended_until: null,
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
