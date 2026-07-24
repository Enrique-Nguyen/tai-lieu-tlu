import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Skip middleware for static assets, auth callback, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return response;
  }

  // 1. Unauthenticated users
  if (!user) {
    if (pathname === '/profile') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', '/profile');
      return NextResponse.redirect(url);
    }
    return response;
  }

  // 2. Authenticated users: Check `is_profile_completed`
  const { data: dbUser } = await supabase
    .from('users')
    .select('is_profile_completed')
    .eq('id', user.id)
    .maybeSingle();

  const isCompleted = dbUser?.is_profile_completed ?? false;

  // Mandatory profile completion redirect
  if (!isCompleted && pathname !== '/profile') {
    const url = request.nextUrl.clone();
    url.pathname = '/profile';
    url.searchParams.set('incomplete', 'true');
    return NextResponse.redirect(url);
  }

  // If user is already authenticated and completed, redirect away from /login
  if (isCompleted && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
