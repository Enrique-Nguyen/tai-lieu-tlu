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

  // If path is public and not login/admin/protected/banned, return early without DB calls
  if (!isProtectedPath && !isLoginPath && !pathname.startsWith('/admin') && !isBannedPath) {
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
    if (isBannedPath) {
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
      .select('is_profile_completed, role, status')
      .eq('id', user.id)
      .maybeSingle()

    // Banned check: If user status is 'banned' and not on /banned -> redirect to /banned
    if (dbUser?.status === 'banned') {
      if (!isBannedPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/banned'
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    // If user is NOT banned but on /banned -> redirect to /
    if (isBannedPath && dbUser?.status !== 'banned') {
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
