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

  // Validate user session securely
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected paths that require authentication
  const protectedPaths = ['/upload', '/profile', '/my-posts', '/admin']
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  // 1. If user is NOT logged in and trying to access protected route -> redirect to /login
  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // 2. If user IS logged in:
  if (user) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('is_profile_completed, role')
      .eq('id', user.id)
      .maybeSingle()

    const isCompleted = dbUser?.is_profile_completed ?? false

    // Mandatory profile completion redirect if not completed and not already on /profile
    if (!isCompleted && pathname !== '/profile') {
      const url = request.nextUrl.clone()
      url.pathname = '/profile'
      url.searchParams.set('incomplete', 'true')
      return NextResponse.redirect(url)
    }

    // If completed and on /login -> redirect to /
    if (isCompleted && pathname === '/login') {
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
