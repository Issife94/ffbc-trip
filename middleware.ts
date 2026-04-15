import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = await createClient({
    getAll() {
      return request.cookies.getAll()
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) =>
        request.cookies.set(name, value, options)
      )
      supabaseResponse = NextResponse.next({ request })
      cookiesToSet.forEach(({ name, value, options }) =>
        supabaseResponse.cookies.set(name, value, options)
      )
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/connexion', request.url))
  }

  if (
    user &&
    (request.nextUrl.pathname.startsWith('/connexion') ||
      request.nextUrl.pathname.startsWith('/inscription') ||
      request.nextUrl.pathname.startsWith('/verification'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/connexion', '/inscription', '/verification'],
}
