import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDesc = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/';

  // Handle errors sent directly by OAuth provider (Azure/Google)
  if (errorParam || errorDesc) {
    const errorUrl = new URL('/login', origin);
    errorUrl.searchParams.set('error', errorParam || 'oauth_error');
    if (errorDesc) errorUrl.searchParams.set('error_description', errorDesc);
    return NextResponse.redirect(errorUrl.toString());
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const user = data.user;

      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.user_metadata?.preferred_username ||
        user.email?.split('@')[0] ||
        'Sinh viên TLU';

      const avatarUrl =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null;

      // Sync user profile in database
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, is_profile_completed')
        .eq('id', user.id)
        .single();

      let isProfileCompleted = existingUser?.is_profile_completed ?? false;

      if (!existingUser) {
        // Create new user record with is_profile_completed = false
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          avatar_url: avatarUrl,
          role: 'student',
          is_profile_completed: false,
        });
        isProfileCompleted = false;
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      const baseUrl = isLocalEnv
        ? origin
        : forwardedHost
        ? `https://${forwardedHost}`
        : origin;

      // Mandatory profile completion check
      if (!isProfileCompleted) {
        return NextResponse.redirect(`${baseUrl}/profile?incomplete=true`);
      }

      return NextResponse.redirect(`${baseUrl}${next}`);
    }

    if (error) {
      const errorUrl = new URL('/login', origin);
      errorUrl.searchParams.set('error', 'auth-callback-failed');
      errorUrl.searchParams.set('error_description', error.message);
      return NextResponse.redirect(errorUrl.toString());
    }
  }

  // Return the user to login with error param if callback failed
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
