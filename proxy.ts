import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  // Protected paths that require authentication
  const protectedPaths = ['/upload', '/profile', '/my-posts', '/admin']
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))
  const isLoginPath = pathname === '/login'
  const isBannedPath = pathname === '/banned'
  const isSuspendedPath = pathname === '/suspended'

  // If path is public and not login/admin/protected/banned/suspended, return early without DB calls
  if (!isProtectedPath && !isLoginPath && !pathname.startsWith('/admin') && !isBannedPath && !isSuspendedPath) {
    return supabaseResponse
  }

  // Validate user session securely for protected/auth routes
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. If user is NOT logged in
  if (!user) {
    if (isProtectedPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    if (isBannedPath || isSuspendedPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // 2. If user IS logged in:
  if (user) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('is_profile_completed, role, status, suspended_until')
      .eq('id', user.id)
      .maybeSingle()

    const userStatus = dbUser?.status || 'active'
    const suspendedUntil = dbUser?.suspended_until

    // Permanent Ban check: If user status is 'banned' -> redirect to /banned
    if (userStatus === 'banned') {
      if (!isBannedPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/banned'
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // Temporary Suspension check: If user status is 'suspended'
    if (userStatus === 'suspended' && suspendedUntil) {
      const now = new Date()
      const expireTime = new Date(suspendedUntil)

      if (now < expireTime) {
        // Suspension active -> redirect to /suspended
        if (!isSuspendedPath) {
          const url = request.nextUrl.clone()
          url.pathname = '/suspended'
          return NextResponse.redirect(url)
        }
        return supabaseResponse
      } else {
        // Suspension expired -> auto reinstate to active in DB
        await supabase
          .from('users')
          .update({
            status: 'active',
            suspended_until: null,
            ban_reason: null,
          })
          .eq('id', user.id)
      }
    }

    // If user is NOT banned and NOT suspended, but on /banned or /suspended -> redirect to /
    if (isBannedPath || isSuspendedPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    const isCompleted = dbUser?.is_profile_completed ?? false

    // Mandatory profile completion redirect if not completed and not already on /profile
    if (!isCompleted && pathname !== '/profile') {
      const url = request.nextUrl.clone()
      url.pathname = '/profile'
      url.searchParams.set('incomplete', 'true')
      return NextResponse.redirect(url)
    }

    // If completed and on /login -> redirect to /
    if (isCompleted && isLoginPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Admin & Moderator route protection
    if (pathname.startsWith('/admin')) {
      if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'moderator')) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
