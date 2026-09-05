import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PARTNER_REF_COOKIE = 'hl_partner_ref'
const REF_PATTERN = /^[a-zA-Z0-9_-]{3,64}$/

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/will')
  const ref = request.nextUrl.searchParams.get('ref')
  const validRef = ref && REF_PATTERN.test(ref) ? ref : null

  // Non-auth-protected routes: only action needed is setting the referral cookie.
  if (!isProtected) {
    if (validRef) {
      const response = NextResponse.next()
      response.cookies.set({
        name: PARTNER_REF_COOKIE,
        value: validRef,
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
        sameSite: 'lax',
        secure: true,
      })
      return response
    }
    return NextResponse.next()
  }

  // Auth-protected routes (/dashboard, /will): refresh Supabase session cookies.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (validRef) {
    supabaseResponse.cookies.set({
      name: PARTNER_REF_COOKIE,
      value: validRef,
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: true,
    })
  }

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}
